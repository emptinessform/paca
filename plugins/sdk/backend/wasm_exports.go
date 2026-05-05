//go:build wasip1

// Package plugin — WASM export layer.
//
// This file provides the four exported functions that the paca host runtime
// expects: Init, HandleRequest, HandleEvent, Shutdown, plus malloc/free for
// host-managed memory allocation.
package plugin

import "unsafe"

// ── Memory management ─────────────────────────────────────────────────────────

// returnBuf is a module-level byte slice used to return data to the host.
var returnBuf []byte

//export malloc
func malloc(size int32) int32 {
	b := make([]byte, size)
	return int32(uintptr(unsafe.Pointer(&b[0])))
}

//export free
func free(_ int32) {}

// ── Exported WASM functions ───────────────────────────────────────────────────

//export Init
func Init() int32 {
	if globalDispatcher == nil {
		return 1
	}
	if err := globalDispatcher.init(); err != nil {
		globalDispatcher.ctx.Log().Error("Init error: " + err.Error())
		return 1
	}
	return 0
}

//export HandleRequest
func HandleRequest(ptr, length int32) (outPtr, outLen int32) {
	payload := wasmSlice(ptr, length)
	result := globalDispatcher.handleRequest(payload)
	returnBuf = result
	if len(returnBuf) == 0 {
		return 0, 0
	}
	return int32(uintptr(unsafe.Pointer(&returnBuf[0]))), int32(len(returnBuf))
}

//export HandleEvent
func HandleEvent(topicPtr, topicLen, payloadPtr, payloadLen int32) {
	topic := string(wasmSlice(topicPtr, topicLen))
	payload := wasmSlice(payloadPtr, payloadLen)
	globalDispatcher.handleEvent(topic, payload)
}

//export Shutdown
func Shutdown() {
	if globalDispatcher != nil && globalDispatcher.plugin != nil {
		globalDispatcher.plugin.Shutdown()
	}
}
