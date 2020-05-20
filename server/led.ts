import { Board } from 'johnny-five';
import { Strip, FORWARD, BACKWARD } from 'node-pixel';
import config from '../config.json'

function sleep(ms): Promise<any> {
  return new Promise((resolve): any => setTimeout(resolve, ms))
}

async function wait(ms): Promise<any> {
  await sleep(ms)
}

enum Direction {
  LEFT = "LEFT",
  RIGHT = "RIGHT"
}

interface BallSpinOptions {
  direction: Direction;
  color: string, // https://github.com/Qix-/color-string
  duration: number, // number of millis for one loop
  loops: number
}

interface BarrelSpinOptions {
  direction: Direction;
  color: string, // https://github.com/Qix-/color-string
  duration: number, // number of millis for how long the pixels are lit
  shiftDelay: number // how long in millis for one shift 
}

class Led {
  private strip: Strip
  private board: Board
  private isStateCleared: boolean;
  private isBoardUnresponsive: boolean = true;
  private connectionAttempts: number = 0;
  private maxConnectionAttempts: number = 5;

  public constructor() {
    this.initializeBoard()    
  }

  private async initializeBoard(): Promise<void> {
    this.board = new Board({repl: false, port: "/dev/ttyACM0"});      
    
    this.board.on("ready", () => {
      console.log("board is ready...")
      this.strip = new Strip({
          board: this.board,
          controller: "FIRMATA",
          strips: [ {pin: 6, length: config.led_pin_size}, ],
          gamma: 2.8,
      });      
      this.isBoardUnresponsive = false;
    });

    this.board.on("close", () => {
      console.log("board is closing...")
      this.isBoardUnresponsive = true;
    });

    this.isStateCleared = false;
    this.connectionAttempts++;
  }

  public isHealthy(): boolean {
    if (this.strip && !this.isBoardUnresponsive) {
      return true;
    } else {
      return false;
    }     
  }

  public clear(): void {
    this.strip.clear()
    this.isStateCleared = true;
  }

  public rightBarrelSpin(): void {
    this.barrelSpin({
      direction: Direction.RIGHT,
      color: "rgb(0, 0, 50)",
      duration: 5000,
      shiftDelay: 500
    });
  }

  public leftBallSpin(): void {
    this.ballSpin({
      direction: Direction.RIGHT,
      color: "rgb(0, 0, 50)",
      duration: 2000,
      loops: 1
    });
  }

  public async barrelSpin(options: BarrelSpinOptions): Promise<void> {
    if (this.isBoardUnresponsive && this.connectionAttempts < this.maxConnectionAttempts) 
      return this.initializeBoard()

    this.strip.clear()
   
    let pos = 0;
    let shiftAmount = 0
    let loopCounter = 0
    let shiftDirection = FORWARD
    let abortAfterLoops = Math.trunc( options.duration / options.shiftDelay )

    if (options.direction == Direction.LEFT) 
      shiftDirection = BACKWARD

    if (options.direction == Direction.RIGHT)
      shiftDirection = FORWARD

    /*
      If the number of pixels on the LED strip is divisible by 3,
      then only light every 3rd pixel (looks cooler and more spaced out).
      Otherwise assume there is an even number of pixels and light only 
      every 2nd pixel.

      God help you, if the number is uneven.
    */
    if (this.strip.length % 3 == 0) {
      shiftAmount = 3
    } else {
      shiftAmount = 2
    } 

    // initially fill the pixels to be illuminated
    while ( pos < this.strip.length ) {
      this.strip.pixel(pos).color(options.color);
      pos = pos + shiftAmount             
    }

    // shift the illuminated pixels 
    while (loopCounter < abortAfterLoops ) {
      loopCounter++;

      this.strip.shift(1, shiftDirection, true);
      this.strip.show();

      await wait( options.shiftDelay )
    }          

    this.strip.clear()    

    return;
  }

  public async ballSpin(options: BallSpinOptions): Promise<void> {
    if (this.isBoardUnresponsive && this.connectionAttempts < this.maxConnectionAttempts)
      return this.initializeBoard()

    this.strip.clear()
    this.isStateCleared = false;
    
    let calculatedPos: number
    let pos = 0;
    let loopCounter = 0
    let abortAfterLoops = options.loops

    if (options.direction == Direction.LEFT)
      calculatedPos = this.strip.length -1

    if (options.direction == Direction.RIGHT)
      calculatedPos = pos    

    while (loopCounter !== abortAfterLoops) {
      if (this.isStateCleared) {
        this.isStateCleared = false;
        return;
      }
      
      this.strip.pixel(calculatedPos).color(options.color);        
      this.strip.show();

      if (options.direction == Direction.LEFT)
        calculatedPos -= 1

      if (options.direction == Direction.RIGHT)
        calculatedPos += 1      

      // abort condition
      if (++pos >= this.strip.length) {
        loopCounter++;
        pos = 0;

        if (options.direction == Direction.LEFT)
          calculatedPos = this.strip.length -1
  
        if (options.direction == Direction.RIGHT)
          calculatedPos = pos

        this.strip.clear()
      } 

      await wait( options.duration / this.strip.length)
    }
    
    this.strip.clear()
    this.isStateCleared = false;

    return;
  }

}

export { Led, Direction, BallSpinOptions, BarrelSpinOptions }
