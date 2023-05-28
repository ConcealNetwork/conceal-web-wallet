const DataBuffer = function () {}

DataBuffer.prototype.alloc = function (size, fill, encoding) {
  return Buffer.alloc(size, fill, encoding);
}

DataBuffer.prototype.from = function (data) {
  return Buffer.from(data);
}

DataBuffer.prototype.write = function (data, offset, length, encoding) {
  return Buffer.from(data, offset, length, encoding);
}

window.Buffer = DataBuffer;