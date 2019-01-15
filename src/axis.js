import { Title } from './title.js';
import { Converter } from './converter.js';

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
   * @param  {object} ranges ranges of values
   * @param  {object} data_limits limits of data in canvas coords
   * @param  {object} axis_limits limits of axis in canvas coords
   * @param  {object} categories categories names for a categorical axis
   */
  constructor(canvas, axis, direction, ranges, data_limits, axis_limits, categories) {
    this.canvas = canvas;
    this.axis   = axis;
    this.direction = direction;
    this.ranges = ranges;
    this.data_limits = data_limits,
    this.limits = axis_limits;
    this.zero = {
      'x': Converter.convertX(0, this.ranges, this.limits),
      'y': Converter.convertY(0, this.ranges, this.limits)
    };
    this.categories = categories;
    this.ticks = [];
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

    this.ctx = this.canvas.getContext("2d");

    this.ctx.beginPath();
    this.ctx.strokeStyle = (this.axis.color ? this.axis.color : "#000");
    this.ctx.lineWidth = (this.axis.width ? this.axis.width : 1);
    this.ctx.moveTo(x_start, y_start);
    this.ctx.lineTo(x_end, y_end);
    this.ctx.stroke();

    this.title = new Title(this.canvas, this.axis.title, this.direction)
      .render(title_top);

    if (this.axis.ticks) {
        this.addTicks();
    }

    return this;
  }


  /**
   * addTicks - add ticks to axis
   *
   * @return {void}
   */
  addTicks() {
    this.calcTicksPoints();
    if (this.axis.ticks) {
      this.drawTicks();
      if (this.axis.ticks.labels) {
          this.drawTicksLabels();
      }
    }
  }

  /**
   * calcTicksPoints - calculate positions of ticks
   *
   * @return {void}  - method changes this.ticks property
   */
  calcTicksPoints() {
    this.tickSize = (this.axis.ticks.size ? this.axis.ticks.size : 0);

    this.ticks = [];
    if (this.axis.type == "continuous") {
      let tickStep = (this.axis.ticks && this.axis.ticks.step ? this.axis.ticks.step : 1);

      let point = {"x" : 0, "y" : 0};
      if (this.direction == "x") {
        while (point.x <= this.ranges.maxx) {
          this.ticks.push({
            'x0': Converter.convertX(point.x, this.ranges, this.limits),
            'y0': this.zero.y,
            'x1': Converter.convertX(point.x, this.ranges, this.limits) ,
            'y1': this.zero.y + this.tickSize,
            'label': point.x
          });
          point.x += tickStep;
        }
        point = {"x" : 0, "y" : - tickStep};
        while (point.x >= this.ranges.minx) {
          this.ticks.push({
            'x0': Converter.convertX(point.x, this.ranges, this.limits),
            'y0': this.zero.y,
            'x1': Converter.convertX(point.x, this.ranges, this.limits),
            'y1': this.zero.y + this.tickSize,
            'label': point.x
          });
          point.x -= tickStep;
        }
      } else {
        while (point.y <= this.ranges.maxy) {
          this.ticks.push({
            'x0': this.zero.x,
            'y0': Converter.convertY(point.y, this.ranges, this.limits),
            'x1': this.zero.x - this.tickSize,
            'y1': Converter.convertY(point.y, this.ranges, this.limits),
            'label': point.y
          });
          point.y += tickStep;
        }
        point = {"x" : -tickStep, "y" : 0 };
        while (point.y >= this.ranges.miny) {
          this.ticks.push({
            'x0': this.zero.x,
            'y0': Converter.convertY(point.y, this.ranges, this.limits),
            'x1': this.zero.x - this.tickSize,
            'y1': Converter.convertY(point.y, this.ranges, this.limits),
            'label': point.y
          });
          point.y -= tickStep;
        }
      }
    } else { // categorical axis
      this.ticks = this.categories.map(
        category => {
          let categoryPos = (this.direction == "x" ?
            Converter.convertX(this.categories.indexOf(category), this.ranges, this.data_limits) :
            Converter.convertY(this.categories.indexOf(category), this.ranges, this.data_limits)
          );
          return {
            'x0' : (this.direction == "x" ? categoryPos : this.zero.x),
            'y0' : (this.direction == "x" ? this.zero.y : categoryPos),
            'x1' : (this.direction == "x" ? categoryPos : this.zero.x - this.tickSize),
            'y1' : (this.direction == "x" ? this.zero.y + this.tickSize : categoryPos),
            'label': category
          }
        }
      );
    }
  }

  /**
   * drawTicks - draw calculated ticks
   *
   * @return {void}
   */
  drawTicks() {
    this.ticks.map(
      tick => this.drawTick(
        tick.x0,
        tick.y0,
        tick.x1,
        tick.y1
      )
    );
  }

  /**
   * drawTick - description
   *
   * @param  {number} x0 description
   * @param  {number} y0 description
   * @param  {number} x1 description
   * @param  {number} y1 description
   * @return {void}
   */
  drawTick(x0, y0, x1, y1) {
    this.ctx.beginPath();
    this.ctx.strokeStyle = (this.axis.color ? this.axis.color : "#000");
    this.ctx.lineWidth = 1;
    this.ctx.moveTo(x0, y0);
    this.ctx.lineTo(x1, y1);
    this.ctx.stroke();
  }


  /**
   * drawTicksLabels - add ticks labels to axis
   *
   * @return {void}
   */
  drawTicksLabels() {
    console.log(this.ticks);
    this.ticks.map(
      tick => this.addTickLabel(
        tick.label,
        (this.direction == "x" ? tick.x1 : tick.x1 - 2* this.tickSize),
        (this.direction == "x" ? tick.y1 + 2 * this.tickSize : tick.y1)
      )
    );
  }


  /**
   * addTickLabel - set mark to the label
   *
   * @param  {string} label description
   * @param  {number} x     description
   * @param  {number} y     description
   * @return {void}
   */
  addTickLabel(label, x, y) {
    console.log(label, x, y);
    this.ctx.font = (this.axis.ticks.font ? this.axis.ticks.font : "");
    this.ctx.fillStyle = (this.axis.ticks.color ? this.axis.ticks.color: "#000");
    this.ctx.textAlign = "center";
    this.ctx.fillText(label, x, y);
  }
}
