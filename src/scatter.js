import { DataPoint } from './data-point.js';
import { AbstractPlot } from './abstract-plot.js';
import { Converter } from './converter.js';

export class Scatter extends AbstractPlot {
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
   * render - render a scatter plot
   *
   * @return {Linear}  current instance
   */
  render() {
    this.points = this.convertData();

    this.ctx = this.canvas.getContext("2d");

    if (this.params.points) {
      this.addDataPoints();
    }

    if (this.params.labels) {
      this.addDataValues();
    }

    return this;
  }
}
