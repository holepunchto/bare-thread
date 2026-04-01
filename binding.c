#include <assert.h>
#include <bare.h>
#include <js.h>
#include <uv.h>

static js_value_t *
bare_thread_get_cpu(js_env_t *env, js_callback_info_t *info) {
  int err;

  int cpu = uv_thread_getcpu();

  if (cpu == UV_ENOTSUP) return NULL;

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
bare_thread_get_id(js_env_t *env, js_callback_info_t *info) {
  int err;

  uv_thread_t thread = uv_thread_self();

  js_value_t *result;
  err = js_create_int64(env, (int64_t) (uintptr_t) thread, &result);
  assert(err == 0);

  return result;
}

static js_value_t *
bare_thread_get_name(js_env_t *env, js_callback_info_t *info) {
  int err;

  uv_thread_t thread = uv_thread_self();

  char name[256];
  err = uv_thread_getname(&thread, name, 256);
  if (err < 0) {
    err = js_throw_error(env, uv_err_name(err), uv_strerror(err));
    assert(err == 0);

    return NULL;
  }

  js_value_t *result;
  err = js_create_string_utf8(env, (utf8_t *) name, -1, &result);
  assert(err == 0);

  return result;
}

static js_value_t *
bare_thread_set_name(js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 1;
  js_value_t *argv[1];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 1);

  utf8_t data[256];
  err = js_get_value_string_utf8(env, argv[0], data, 256, NULL);
  assert(err == 0);

  err = uv_thread_setname((char *) data);
  if (err < 0) {
    err = js_throw_error(env, uv_err_name(err), uv_strerror(err));
    assert(err == 0);

    return NULL;
  }

  return NULL;
}

static js_value_t *
bare_thread_get_priority(js_env_t *env, js_callback_info_t *info) {
  int err;

  uv_thread_t thread = uv_thread_self();

  int priority;
  err = uv_thread_getpriority(thread, &priority);
  if (err < 0) {
    err = js_throw_error(env, uv_err_name(err), uv_strerror(err));
    assert(err == 0);

    return NULL;
  }

  js_value_t *result;
  err = js_create_int32(env, priority, &result);
  assert(err == 0);

  return result;
}

static js_value_t *
bare_thread_set_priority(js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 1;
  js_value_t *argv[1];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 1);

  int priority;
  err = js_get_value_int32(env, argv[0], &priority);
  assert(err == 0);

  uv_thread_t thread = uv_thread_self();

  err = uv_thread_setpriority(thread, priority);
  if (err < 0) {
    err = js_throw_error(env, uv_err_name(err), uv_strerror(err));
    assert(err == 0);

    return NULL;
  }

  return NULL;
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

  V("getCPU", bare_thread_get_cpu)
  V("getID", bare_thread_get_id)
  V("getName", bare_thread_get_name)
  V("setName", bare_thread_set_name)
  V("getPriority", bare_thread_get_priority)
  V("setPriority", bare_thread_set_priority)
#undef V

  js_value_t *priority;
  err = js_create_object(env, &priority);
  assert(err == 0);

  err = js_set_named_property(env, exports, "priority", priority);
  assert(err == 0);

#define V(name) \
  { \
    js_value_t *val; \
    err = js_create_int32(env, UV_THREAD_##name, &val); \
    assert(err == 0); \
    err = js_set_named_property(env, priority, #name, val); \
    assert(err == 0); \
  }

  V(PRIORITY_LOWEST);
  V(PRIORITY_BELOW_NORMAL);
  V(PRIORITY_NORMAL);
  V(PRIORITY_ABOVE_NORMAL);
  V(PRIORITY_HIGHEST);

  return exports;
}

BARE_MODULE(bare_thread, bare_thread_exports)
