import { DataPoint } from './data-point.js';
import { AbstractPlot } from './abstract-plot.js';
import { Converter } from './converter.js';

export class Linear extends AbstractPlot {

  /**
   * constructor - create a linear plot
   *
   * @param  {Element} canvas parent canvas element
   * @param  {object} plot   array of data points
   * @param  {object} range common range for the series of plots
   * @param  {object} limits common coords limits for the series of plots
   * @param  {bool} x_continuous is x-axis continuous (true) or categorical (false)
   * @param  {bool} y_continuous is y-axis continuous (true) or categorical (false)
   */
  constructor(canvas, plot, range, limits, x_continuous, y_continuous) {
    super(canvas, plot, range, limits, x_continuous, y_continuous);
  }

  /**
   * render - render a linear plot
   *
   * @return {Linear}  current instance
   */
  render() {
    this.points = this.convertData();

    this.ctx = this.canvas.getContext("2d");

    this.plotLine();

    if (this.params.points) {
      this.addDataPoints();
    }

    if (this.params.labels) {
      this.addDataValues();
    }

    return this;
  }

  /**
   * plotLine - plot the line
   *
   * @return {void}
   */
  plotLine() {
    this.ctx.beginPath();
    this.ctx.moveTo(this.points[0].x, this.points[0].y);
    for (let i = 1; i < this.points.length; i++) {
      this.ctx.lineTo(this.points[i].x, this.points[i].y);
    }
    this.ctx.strokeStyle = ( this.params.line.color ? this.params.line.color : "#000" );
    this.ctx.lineWidth = (this.params.line.width ? this.params.line.width : 1);
    this.ctx.stroke();
  }

}
