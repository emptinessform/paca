//go:build wasip1

package plugin

import (
	"encoding/json"
	"unsafe"
)

// ── WASM DB backend ───────────────────────────────────────────────────────────

type wasmDBBackend struct{}

func newWASMDBBackend() DBBackend { return &wasmDBBackend{} }

func (b *wasmDBBackend) Query(sql string, params []any) (*DBQueryResult, error) {
	sqlBytes := []byte(sql)
	paramsJSON, err := json.Marshal(params)
	if err != nil {
		return nil, err
	}

	resPtr, resLen := hostDBQuery(
		ptrOf(sqlBytes), int32(len(sqlBytes)),
		ptrOf(paramsJSON), int32(len(paramsJSON)),
	)
	if resLen == 0 {
		return &DBQueryResult{}, nil
	}
	resBytes := wasmSlice(resPtr, resLen)

	var result DBQueryResult
	if err := json.Unmarshal(resBytes, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (b *wasmDBBackend) Exec(sql string, params []any) (int64, error) {
	sqlBytes := []byte(sql)
	paramsJSON, err := json.Marshal(params)
	if err != nil {
		return 0, err
	}

	rowsAffected, errPtr, errLen := hostDBExec(
		ptrOf(sqlBytes), int32(len(sqlBytes)),
		ptrOf(paramsJSON), int32(len(paramsJSON)),
	)
	if errLen > 0 {
		return 0, &hostError{string(wasmSlice(errPtr, errLen))}
	}
	return int64(rowsAffected), nil
}

// ── WASM KV backend ───────────────────────────────────────────────────────────

type wasmKVBackend struct{}

func newWASMKVBackend() KVBackend { return &wasmKVBackend{} }

func (b *wasmKVBackend) Get(key string) (string, bool) {
	keyBytes := []byte(key)
	valPtr, valLen := hostStorageGet(ptrOf(keyBytes), int32(len(keyBytes)))
	if valLen == 0 {
		return "", false
	}
	return string(wasmSlice(valPtr, valLen)), true
}

func (b *wasmKVBackend) Set(key, value string) {
	keyBytes := []byte(key)
	valBytes := []byte(value)
	hostStorageSet(ptrOf(keyBytes), int32(len(keyBytes)), ptrOf(valBytes), int32(len(valBytes)))
}

func (b *wasmKVBackend) Delete(key string) {
	keyBytes := []byte(key)
	hostStorageDelete(ptrOf(keyBytes), int32(len(keyBytes)))
}

// ── WASM log backend ──────────────────────────────────────────────────────────

type wasmLogBackend struct{}

func newWASMLogBackend() LogBackend { return &wasmLogBackend{} }

func (b *wasmLogBackend) Log(level int, msg string) {
	msgBytes := []byte(msg)
	if len(msgBytes) == 0 {
		return
	}
	hostLog(int32(level), ptrOf(msgBytes), int32(len(msgBytes)))
}

// ── WASM config backend ───────────────────────────────────────────────────────

type wasmConfigBackend struct{}

func newWASMConfigBackend() ConfigBackend { return &wasmConfigBackend{} }

func (b *wasmConfigBackend) Get(key string) (string, bool) {
	keyBytes := []byte(key)
	valPtr, valLen := hostConfigGet(ptrOf(keyBytes), int32(len(keyBytes)))
	if valLen == 0 {
		return "", false
	}
	return string(wasmSlice(valPtr, valLen)), true
}

// ── EmitEvent ─────────────────────────────────────────────────────────────────

// EmitEvent publishes an event to the paca event bus from WASM.
func EmitEvent(topic string, payload any) {
	topicBytes := []byte(topic)
	payloadBytes, _ := json.Marshal(payload)
	hostEventEmit(
		ptrOf(topicBytes), int32(len(topicBytes)),
		ptrOf(payloadBytes), int32(len(payloadBytes)),
	)
}

// ── Helpers ───────────────────────────────────────────────────────────────────

//go:nocheckptr
func wasmSlice(ptr, length int32) []byte {
	if length == 0 || ptr == 0 {
		return nil
	}
	// In WASM linear memory, ptr is a raw byte offset, not a GC-managed pointer.
	// unsafe.Add avoids the uintptr→unsafe.Pointer pattern that go vet flags.
	p := unsafe.Add(unsafe.Pointer(nil), uintptr(ptr))
	return unsafe.Slice((*byte)(p), length)
}

func ptrOf(b []byte) int32 {
	if len(b) == 0 {
		return 0
	}
	return int32(uintptr(unsafe.Pointer(&b[0])))
}

type hostError struct{ msg string }

func (e *hostError) Error() string { return e.msg }
