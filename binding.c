#include <assert.h>
#include <bare.h>
#include <js.h>

static js_value_t *
bare_thread_getcpu(js_env_t *env, js_callback_info_t *info) {
  int err;

  int cpu = uv_thread_getcpu();
  if (cpu < 0) {
    err = js_throw_error(env, uv_err_name(cpu), uv_strerror(cpu));
    assert(err == 0);

    return NULL;
  }

  js_value_t *result;
  err = js_create_int32(env, cpu, &result);
  assert(err == 0);

  return result;
}

static js_value_t *
bare_thread_exports(js_env_t *env, js_value_t *exports) {
  int err;

#define V(name, fn) \
  { \
    js_value_t *val; \
    err = js_create_function(env, name, -1, fn, NULL, &val); \
    assert(err == 0); \
    err = js_set_named_property(env, exports, name, val); \
    assert(err == 0); \
  }

  V("getThreadCPU", bare_thread_getcpu)
#undef V

  return exports;
}

BARE_MODULE(bare_thread, bare_thread_exports)
