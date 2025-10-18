class MicProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = [];
    this.sampleRate = 16000;
    this.chunkSize = this.sampleRate * 1;
    //
    this.port.onmessage = (e) => {
      const {command, value} = e.data || {};
      if (command === "chunkSize") {
        this.chunkSize = Math.max(1, Math.floor(this.sampleRate * Number(value)));
      }
    };
  }
  //
  process(inputs) {
    const input = inputs[0];
    if (input.length > 0) {
      const channel = input[0];
      this.buffer.push(new Float32Array(channel));
      //
      const totalLength = this.buffer.reduce((a, c) => a + c.length, 0);
      if (totalLength >= this.chunkSize) {
        const merged = new Float32Array(totalLength);
        //
        let offset = 0;
        for (const c of this.buffer) {
          merged.set(c, offset);
          offset += c.length;
        }
        //
        this.port.postMessage(merged);
        this.buffer = [];
      }
    }
    //
    return true;
  }
}

registerProcessor("mic-processor", MicProcessor);
