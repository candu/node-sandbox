#ifndef BUILDING_NODE_EXTENSION
#define BUILDING_NODE_EXTENSION
#endif

#include <node.h>
#include <v8.h>

#include "Int64.h"

using namespace node;
using namespace v8;

Persistent<Function> Int64::constructor;

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
  tpl->PrototypeTemplate()->Set(
    String::NewSymbol("shiftLeft"),
    FunctionTemplate::New(ShiftLeft)->GetFunction()
  );
  constructor = Persistent<Function>::New(tpl->GetFunction());
  exports->Set(String::NewSymbol("Int64"), constructor);
}

Int64::Int64() {
  mValue = 0;
}

Int64::Int64(const Local<Number>& n) {
  mValue = static_cast<uint64_t>(n->NumberValue());
}

Int64::Int64(const Local<Number>& hi, const Local<Number>& lo) {
  uint32_t highBits = static_cast<uint32_t>(hi->NumberValue());
  uint32_t lowBits = static_cast<uint32_t>(lo->NumberValue());
  mValue =
    (static_cast<uint64_t>(highBits) << 32) |
    (static_cast<uint64_t>(lowBits));
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
      ThrowException(Exception::TypeError(String::New("Invalid string")));
    }
  }
}

Int64::~Int64() {}

Handle<Value> Int64::New(const Arguments& args) {
  HandleScope scope;
  Int64* obj = NULL;
  if (args.Length() == 0) {
    obj = new Int64();
  } else if (args.Length() == 1) {
    if (args[0]->IsNumber()) {
      obj = new Int64(args[0]->ToNumber());
    } else if (args[0]->IsString()) {
      obj = new Int64(args[0]->ToString());
    }
  } else if (args.Length() == 2) {
    if (args[0]->IsNumber() && args[1]->IsNumber()) {
      obj = new Int64(args[0]->ToNumber(), args[1]->ToNumber());
    }
  }
  if (obj == NULL) {
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
  uint32_t highBits = static_cast<uint32_t>(obj->mValue >> 32);
  return scope.Close(Int32::NewFromUnsigned(highBits));
}

Handle<Value> Int64::Low32(const Arguments& args) {
  HandleScope scope;
  Int64* obj = ObjectWrap::Unwrap<Int64>(args.This());
  uint32_t lowBits = static_cast<uint32_t>(obj->mValue & 0xffffffffull);
  return scope.Close(Int32::NewFromUnsigned(lowBits));
}

Handle<Value> Int64::ShiftLeft(const Arguments& args) {
  HandleScope scope;
  if (args.Length() < 1) {
    ThrowException(Exception::TypeError(String::New("Argument required")));
    return scope.Close(Undefined());
  }
  if (!args[0]->IsNumber()) {
    ThrowException(Exception::TypeError(String::New("Integer expected")));
    return scope.Close(Undefined());
  }
  Int64* obj = ObjectWrap::Unwrap<Int64>(args.This());
  uint64_t shiftBy = static_cast<uint64_t>(args[0]->ToNumber()->NumberValue());
  uint64_t value = obj->mValue << shiftBy;
  Local<Value> argv[2] = {
    Int32::NewFromUnsigned(static_cast<uint32_t>(value >> 32)),
    Int32::NewFromUnsigned(static_cast<uint32_t>(value & 0xffffffffull))
  };
  Local<Object> instance = constructor->NewInstance(2, argv);
  return scope.Close(instance);
}

/*
Handle<Value> Int64::ShiftRight(const Arguments& args) {
  HandleScope scope;
  Int64* obj = ObjectWrap::Unwrap<Int64>(args.This());
  uint32_t lowBits = static_cast<uint32_t>(obj->mValue & 0xffffffffull);
  return scope.Close(Int32::NewFromUnsigned(lowBits));
}
*/
