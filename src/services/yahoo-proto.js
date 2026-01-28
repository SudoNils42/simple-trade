import protobuf from 'protobufjs'

const protoSchema = `
syntax = "proto3";

message YatTicker {
  string id = 1;
  float price = 2;
  int64 time = 3;
  string exchange = 5;
  int32 quoteType = 6;
  int32 marketHours = 7;
  float changePercent = 8;
  float dayVolume = 9;
  float dayHigh = 10;
  float dayLow = 11;
  float change = 12;
  float openPrice = 14;
  float previousClose = 15;
  int64 lastSize = 21;
  float bid = 22;
  int64 bidSize = 23;
  float ask = 24;
  int64 askSize = 25;
  int64 priceHint = 26;
  int64 vol_24hr = 27;
  double circulatingSupply = 31;
  double marketCap = 32;
}
`

let YatTicker = null

export function initDecoder() {
  const root = protobuf.parse(protoSchema).root
  YatTicker = root.lookupType('YatTicker')
}

export function decodeMessage(buffer) {
  if (!YatTicker) initDecoder()
  
  try {
    const message = YatTicker.decode(new Uint8Array(buffer))
    return YatTicker.toObject(message)
  } catch (e) {
    return null
  }
}
