import { Board } from 'johnny-five';
import { Strip } from 'node-pixel';

function sleep(ms): Promise<any> {
  return new Promise((resolve): any => setTimeout(resolve, ms))
}

async function wait(ms): Promise<any> {
  await sleep(ms)
}

export enum Direction {
  LEFT = 1,
  RIGHT
}

interface SpinOptions {
  direction: Direction;
  color: string, // https://github.com/Qix-/color-string
  speed: number, // fps
  loops: number
}

class Led {
  private strip: Strip
  private board: Board  

  public constructor() {
    this.board = new Board();
    this.board.on("ready", () => {      
      this.strip = new Strip({
          board: this.board,
          controller: "FIRMATA",
          strips: [ {pin: 6, length: 24}, ],
          gamma: 2.8,
      });
      console.log("strip initialized")
    });
  }

  public stopLed(): void {
    this.strip.clear()
  }

  public leftSpin(): void {
    this.spin({
      direction: Direction.LEFT,
      color: "rgb(0, 0, 50)",
      speed: 12, // fps
      loops: 2
    });
  }

  private async spin(options: SpinOptions): Promise<void> {

    this.strip.clear()
   
    var pos = 0;
    var loopCounter = 0
    var abortAfterLoops = options.loops

    this.strip.pixel(pos).color(options.color);
    this.strip.show();

    console.log(this.strip.length)

    while (loopCounter !== abortAfterLoops ) {
      let calculatedPos: number = pos;

      if (++pos >= this.strip.length || calculatedPos >= this.strip.length) {
          loopCounter++;
          pos = 0;
          this.strip.clear()
      } 
            
      if (options.direction == Direction.LEFT)
        calculatedPos = this.strip.length - pos

      console.log(calculatedPos)

      this.strip.pixel(calculatedPos).color(options.color);
      this.strip.show();

      await wait( 1000 / options.speed)
    }
    
    this.strip.clear()

    return;
  }

}

export { Led }
