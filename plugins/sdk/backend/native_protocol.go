//go:build !wasip1

package plugin

import "encoding/json"

// hostResponse mirrors the shape expected by the paca API host runtime when
// deserialising the HandleRequest return value.
type hostResponse struct {
	Status  int               `json:"status"`
	Headers map[string]string `json:"headers"`
	Body    []byte            `json:"body"`
}

func marshalResponse(r *Response) []byte {
	data, _ := json.Marshal(hostResponse{
		Status:  r.StatusCode,
		Headers: r.Headers,
		Body:    r.Body,
	})
	return data
}

func unmarshalJSON(data []byte, dst any) error {
	return json.Unmarshal(data, dst)
}

func errorResponse(status int, msg string) []byte {
	body, _ := json.Marshal(map[string]string{"error": msg})
	data, _ := json.Marshal(hostResponse{
		Status:  status,
		Headers: map[string]string{"Content-Type": "application/json"},
		Body:    body,
	})
	return data
}
