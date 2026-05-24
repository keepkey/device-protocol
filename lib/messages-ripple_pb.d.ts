// package: 
// file: messages-ripple.proto

import * as jspb from "google-protobuf";

export class RippleGetAddress extends jspb.Message {
  clearAddressNList(): void;
  getAddressNList(): Array<number>;
  setAddressNList(value: Array<number>): void;
  addAddressN(value: number, index?: number): number;

  hasShowDisplay(): boolean;
  clearShowDisplay(): void;
  getShowDisplay(): boolean | undefined;
  setShowDisplay(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RippleGetAddress.AsObject;
  static toObject(includeInstance: boolean, msg: RippleGetAddress): RippleGetAddress.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RippleGetAddress, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RippleGetAddress;
  static deserializeBinaryFromReader(message: RippleGetAddress, reader: jspb.BinaryReader): RippleGetAddress;
}

export namespace RippleGetAddress {
  export type AsObject = {
    addressNList: Array<number>,
    showDisplay?: boolean,
  }
}

export class RippleAddress extends jspb.Message {
  hasAddress(): boolean;
  clearAddress(): void;
  getAddress(): string | undefined;
  setAddress(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RippleAddress.AsObject;
  static toObject(includeInstance: boolean, msg: RippleAddress): RippleAddress.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RippleAddress, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RippleAddress;
  static deserializeBinaryFromReader(message: RippleAddress, reader: jspb.BinaryReader): RippleAddress;
}

export namespace RippleAddress {
  export type AsObject = {
    address?: string,
  }
}

export class RippleSignTx extends jspb.Message {
  clearAddressNList(): void;
  getAddressNList(): Array<number>;
  setAddressNList(value: Array<number>): void;
  addAddressN(value: number, index?: number): number;

  hasFee(): boolean;
  clearFee(): void;
  getFee(): number | undefined;
  setFee(value: number): void;

  hasFlags(): boolean;
  clearFlags(): void;
  getFlags(): number | undefined;
  setFlags(value: number): void;

  hasSequence(): boolean;
  clearSequence(): void;
  getSequence(): number | undefined;
  setSequence(value: number): void;

  hasLastLedgerSequence(): boolean;
  clearLastLedgerSequence(): void;
  getLastLedgerSequence(): number | undefined;
  setLastLedgerSequence(value: number): void;

  hasPayment(): boolean;
  clearPayment(): void;
  getPayment(): RipplePayment | undefined;
  setPayment(value?: RipplePayment): void;

  hasMemo(): boolean;
  clearMemo(): void;
  getMemo(): string | undefined;
  setMemo(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RippleSignTx.AsObject;
  static toObject(includeInstance: boolean, msg: RippleSignTx): RippleSignTx.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RippleSignTx, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RippleSignTx;
  static deserializeBinaryFromReader(message: RippleSignTx, reader: jspb.BinaryReader): RippleSignTx;
}

export namespace RippleSignTx {
  export type AsObject = {
    addressNList: Array<number>,
    fee?: number,
    flags?: number,
    sequence?: number,
    lastLedgerSequence?: number,
    payment?: RipplePayment.AsObject,
    memo?: string,
  }
}

export class RipplePayment extends jspb.Message {
  hasAmount(): boolean;
  clearAmount(): void;
  getAmount(): number | undefined;
  setAmount(value: number): void;

  hasDestination(): boolean;
  clearDestination(): void;
  getDestination(): string | undefined;
  setDestination(value: string): void;

  hasDestinationTag(): boolean;
  clearDestinationTag(): void;
  getDestinationTag(): number | undefined;
  setDestinationTag(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RipplePayment.AsObject;
  static toObject(includeInstance: boolean, msg: RipplePayment): RipplePayment.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RipplePayment, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RipplePayment;
  static deserializeBinaryFromReader(message: RipplePayment, reader: jspb.BinaryReader): RipplePayment;
}

export namespace RipplePayment {
  export type AsObject = {
    amount?: number,
    destination?: string,
    destinationTag?: number,
  }
}

export class RippleSignedTx extends jspb.Message {
  hasSignature(): boolean;
  clearSignature(): void;
  getSignature(): Uint8Array | string;
  getSignature_asU8(): Uint8Array;
  getSignature_asB64(): string;
  setSignature(value: Uint8Array | string): void;

  hasSerializedTx(): boolean;
  clearSerializedTx(): void;
  getSerializedTx(): Uint8Array | string;
  getSerializedTx_asU8(): Uint8Array;
  getSerializedTx_asB64(): string;
  setSerializedTx(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RippleSignedTx.AsObject;
  static toObject(includeInstance: boolean, msg: RippleSignedTx): RippleSignedTx.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RippleSignedTx, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RippleSignedTx;
  static deserializeBinaryFromReader(message: RippleSignedTx, reader: jspb.BinaryReader): RippleSignedTx;
}

export namespace RippleSignedTx {
  export type AsObject = {
    signature: Uint8Array | string,
    serializedTx: Uint8Array | string,
  }
}

