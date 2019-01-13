import { Title } from './title.js';

/**
 * Class for axis
 */
export class Axis {


  /**
   * constructor - create an axis x
   *
   * @param  {Element} canvas parent canvas element
   * @param  {object} axis     axis parameters
   * @param  {string} direction axis direction - x or y
   * @param  {object} zero coords of (0,0)
   */
  constructor(canvas, axis, direction, zero) {
    this.canvas = canvas;
    this.axis   = axis;
    this.direction = direction;
    this.zero = zero;
  }


  /**
   * render - put an axis onto the canvas
   *
   * @return {AxisX}  current axis instance
   */
  render() {

    let x_start = 0;
    let x_end   = 0;
    let y_start = 0;
    let y_end = 0;
    let title_top = 0;

    if (this.direction == "x") {
      x_start = 50;
      x_end   = this.canvas.width - 50;
      y_start = this.zero.y;
      y_end   = this.zero.y;
      title_top = this.zero.y + 20;
    } else if (this.direction == "y") {
      x_start = this.zero.x;
      x_end   = this.zero.x;
      y_start = 50;
      y_end   = this.canvas.height - 50;
      title_top = this.zero.x - 20;
    }

    let ctx = this.canvas.getContext("2d");

    ctx.beginPath();
    ctx.moveTo(x_start, y_start);
    ctx.lineTo(x_end, y_end);
    ctx.stroke();

    this.title = new Title(this.canvas, this.axis.title, this.direction)
      .render(title_top);

    return this;
  }
}
