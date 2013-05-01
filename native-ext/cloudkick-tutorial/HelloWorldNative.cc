#include <v8.h>
#include <node.h>

using namespace node;
using namespace v8;

class HelloWorld : ObjectWrap {
 private:
  int m_count;
 public:
  static Persistent<FunctionTemplate> s_ct;

  static void Init(Handle<Object> target) {
    HandleScope scope;
    Local<FunctionTemplate> t = FunctionTemplate::New(New);
    s_ct = Persistent<FunctionTemplate>::New(t);
    s_ct->InstanceTemplate()->SetInternalFieldCount(1);
    s_ct->SetClassName(String::NewSymbol("HelloWorld"));
    NODE_SET_PROTOTYPE_METHOD(s_ct, "hello", Hello);
    NODE_SET_PROTOTYPE_METHOD(s_ct, "count", Count);
    target->Set(String::NewSymbol("HelloWorld"), s_ct->GetFunction());
  }

  HelloWorld() : m_count(0) {}
  ~HelloWorld() {}

  static Handle<Value> New(const Arguments& args) {
    HandleScope scope;
    HelloWorld* hw = new HelloWorld();
    hw->Wrap(args.This());
    return args.This();
  }

  static Handle<Value> Hello(const Arguments& args) {
    HandleScope scope;
    HelloWorld* hw = ObjectWrap::Unwrap<HelloWorld>(args.This());
    hw->m_count++;
    Local<String> result = String::New("Hello World");
    return scope.Close(result);
  }

  static Handle<Value> Count(const Arguments& args) {
    HandleScope scope;
    HelloWorld* hw = ObjectWrap::Unwrap<HelloWorld>(args.This());
    Local<Number> result = Number::New(hw->m_count);
    return scope.Close(result);
  }
};

Persistent<FunctionTemplate> HelloWorld::s_ct;

extern "C" {
  static void init(Handle<Object> target) {
    HelloWorld::Init(target);
  }

  NODE_MODULE(HelloWorldNative, init);
}
