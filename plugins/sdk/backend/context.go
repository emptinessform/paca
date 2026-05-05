package plugin

import "strings"

// Context is passed to [Plugin.Init] and used to register route handlers and
// event subscriptions.  It also gives access to platform services such as the
// database, key-value store, logger, and configuration.
type Context struct {
	routes map[routeKey]RouteHandler
	events map[string]EventHandler
	db     *DB
	kv     *KV
	log    *Logger
	cfg    *Config
}

// routeKey uniquely identifies a registered route by HTTP method + path.
type routeKey struct {
	method string
	path   string
}

// Route registers a handler for the given HTTP method and path.
// Paths are relative to the plugin's base URL:
//
//	/api/v1/plugins/{pluginId}/projects/:projectId/{path}
//
// Path parameters are available via [Request.PathParam].
func (c *Context) Route(method, path string, handler RouteHandler) {
	c.routes[routeKey{strings.ToUpper(method), path}] = handler
}

// On registers an event handler for the given topic.
//
// Example topics: "task.created", "task.deleted", "member.added".
func (c *Context) On(topic string, handler EventHandler) {
	c.events[topic] = handler
}

// DB returns a helper for typed SQL operations scoped to the plugin schema.
func (c *Context) DB() *DB { return c.db }

// KV returns a helper for simple key-value persistence.
func (c *Context) KV() *KV { return c.kv }

// Log returns a structured logger.
func (c *Context) Log() *Logger { return c.log }

// Config returns a read-only helper for plugin configuration values.
func (c *Context) Config() *Config { return c.cfg }

// RouteHandler is the function signature for HTTP route handlers.
type RouteHandler func(req *Request, res *Response)

// EventHandler is the function signature for event subscription handlers.
type EventHandler func(evt *Event)

// newContext constructs a Context backed by the provided implementations.
// Called by the WASM runtime (with host-function backends) and by
// [plugintest] (with in-memory backends).
func newContext(db DBBackend, kv KVBackend, log LogBackend, cfg ConfigBackend) *Context {
	return &Context{
		routes: make(map[routeKey]RouteHandler),
		events: make(map[string]EventHandler),
		db:     &DB{backend: db},
		kv:     &KV{backend: kv},
		log:    &Logger{backend: log},
		cfg:    &Config{backend: cfg},
	}
}
