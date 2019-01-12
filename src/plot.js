import { Axis } from './axis.js';
import { Range } from './range.js';
import { Linear } from './linear.js';
import { Converter } from './converter.js';

export class Plot {

  /**
   * constructor - create a plot on the canvas
   *
   * @param  {Element} canvas  parent canvas element
   * @param  {array} series collection of plots descriptions
   * @param  {array} axis_x x-axis parameters
   * @param  {array} axis_y y-axis parameters
   */
  constructor(canvas, series, axis_x, axis_y) {
    this.canvas = canvas;
    this.series = series;
    this.axis_x = axis_x;
    this.axis_y = axis_y;
  }


  /**
   * render - render a plot
   *
   * @return {Plot}  current instance of the plot
   */
  render() {
    // calc ranges entire the series
    this.ranges = new Range(this.series)
      .getRanges();

    // calculate limits
    this.limits = {
      'minx': (this.ranges.minx == 0 ? 50 : 60),
      'maxx': this.canvas.width - 60,
      'miny': (this.ranges.miny == 0 ? this.canvas.height - 50 : this.canvas.height - 60),
      'maxy': 60
    }

    // dwaw asix x and y
    this.addAxisX();
    this.addAxisY();

    // draw plots
    this.plots = this.series.map(plot => this.draw(plot));

    return this;
  }


  /**
   * draw - draw a single plot from the series
   *
   * @param  {array} plot plot description
   * @return {void}
   */
  draw(plot) {
    if (plot.type = "linear") {
      return new Linear(this.canvas, plot, this.ranges, this.limits)
        .render();
    }
  }

  /**
   * addAxisX - add x-axis to the plot
   *
   * @return {void}
   */
  addAxisX() {
    if (this.axis_x) {
      new Axis(this.canvas, this.axis_x, "x", {
        'x': Converter.convertX(0, this.ranges, this.limits),
        'y': Converter.convertY(0, this.ranges, this.limits)
      }).render();
    }
  }


  /**
   * addAxisY - add y-axis to the plot
   *
   * @return {void}
   */
  addAxisY() {
    if (this.axis_y) {
      new Axis(this.canvas, this.axis_y, "y", {
        'x': Converter.convertX(0, this.ranges, this.limits),
        'y': Converter.convertY(0, this.ranges, this.limits)
      }).render();
    }
  }
}
