#ifndef BUILDING_NODE_EXTENSION
#define BUILDING_NODE_EXTENSION
#endif

#include <node.h>
#include <v8.h>

#include "Int64.h"

using namespace node;
using namespace v8;

void Int64::Init(Handle<Object> exports) {
  Local<FunctionTemplate> tpl = FunctionTemplate::New(New);
  tpl->SetClassName(String::NewSymbol("Int64"));
  tpl->InstanceTemplate()->SetInternalFieldCount(1);
  tpl->PrototypeTemplate()->Set(
    String::NewSymbol("toString"),
    FunctionTemplate::New(ToString)->GetFunction()
  );
  tpl->PrototypeTemplate()->Set(
    String::NewSymbol("high32"),
    FunctionTemplate::New(High32)->GetFunction()
  );
  tpl->PrototypeTemplate()->Set(
    String::NewSymbol("low32"),
    FunctionTemplate::New(Low32)->GetFunction()
  );
  Persistent<Function> constructor = Persistent<Function>::New(
    tpl->GetFunction()
  );
  exports->Set(String::NewSymbol("Int64"), constructor);
}

Int64::Int64() {
  mValue = 0;
}

Int64::Int64(const Local<Number>& n) {
  mValue = static_cast<uint64_t>(n->NumberValue());
}

Int64::Int64(const Local<String>& s) {
  String::Utf8Value utf8(s);
  mValue = 0ull;
  for (int i = 0; i < utf8.length(); i++) {
    mValue <<= 4;
    char c = (*utf8)[i];
    if (c >= '0' && c <= '9') {
      mValue += (c - '0');
    } else if (c >= 'a' && c <= 'f') {
      mValue += 10 + (c - 'a');
    } else if (c >= 'A' && c <= 'F') {
      mValue += 10 + (c - 'A');
    } else {
      // TODO: throw exception
    }
  }
}

Int64::~Int64() {}

Handle<Value> Int64::New(const Arguments& args) {
  HandleScope scope;
  Int64* obj;
  if (args.Length() < 1) {
    obj = new Int64();
  } else if (args[0]->IsNumber()) {
    obj = new Int64(args[0]->ToNumber());
  } else if (args[0]->IsString()) {
    obj = new Int64(args[0]->ToString());
  } else {
    ThrowException(Exception::TypeError(String::New("Wrong arguments")));
    return scope.Close(Undefined());
  }
  obj->Wrap(args.This());
  return args.This();
}

Handle<Value> Int64::ToString(const Arguments& args) {
  HandleScope scope;
  Int64* obj = ObjectWrap::Unwrap<Int64>(args.This());
  char buf[17];
  buf[16] = '\0';
  uint64_t value = obj->mValue;
  for (int i = 15; i >= 0; i--) {
    uint64_t next = value & 0xfull;
    if (next <= 0x9ull) {
      buf[i] = '0' + next;
    } else {
      buf[i] = 'a' + (next - 10);
    }
    value >>= 4;
  }
  return scope.Close(String::New(buf));
}

Handle<Value> Int64::High32(const Arguments& args) {
  HandleScope scope;
  Int64* obj = ObjectWrap::Unwrap<Int64>(args.This());
  uint32_t highBits = static_cast<uint32_t>(obj->mValue & 0xffffffffull);
  return scope.Close(Int32::NewFromUnsigned(highBits));
}

Handle<Value> Int64::Low32(const Arguments& args) {
  HandleScope scope;
  Int64* obj = ObjectWrap::Unwrap<Int64>(args.This());
  uint32_t lowBits = static_cast<uint32_t>(obj->mValue >> 32);
  return scope.Close(Int32::NewFromUnsigned(lowBits));
}
