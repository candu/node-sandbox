#ifndef INT64_H
#define INT64_H

#include <node.h>
#include <v8.h>

using namespace node;
using namespace v8;

class Int64 : public ObjectWrap {
 public:
  static void Init(Handle<Object> exports);

 private:
  Int64();
  Int64(const Local<Number>& n);
  Int64(const Local<String>& s);
  ~Int64();

  static Handle<Value> New(const Arguments& args);
  static Handle<Value> ToString(const Arguments& args);
  /*
  static Handle<Value> High32(const Arguments& args);
  static Handle<Value> Low32(const Arguments& args);
  static Handle<Value> ShiftLeft(const Arguments& args);
  static Handle<Value> ShiftRight(const Arguments& args);
  static Handle<Value> And(const Arguments& args);
  static Handle<Value> Or(const Arguments& args);
  static Handle<Value> Xor(const Arguments& args);
  */

  int64_t mValue;
};

#endif
