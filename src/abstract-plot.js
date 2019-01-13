import { DataPoint } from './data-point.js';
import { Converter } from './converter.js';

export class AbstractPlot {
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
    this.canvas = canvas;
    this.data   = plot.data;
    this.params = plot.params;
    this.range  = range;
    this.limits = limits;
    this.x_continuous = x_continuous;
    this.y_continuous = y_continuous;
  }

  /**
   * convertData - convert data into plot coords
   *
   * @return {array}  array of points in plot's coord system
   */
  convertData() {

    return this.data.map(point => new DataPoint(
      Converter.convertX(
        (this.x_continuous ? point.x : this.data.map(p => p.x).indexOf(point.x) + 1),
        this.range, this.limits
      ),
      Converter.convertY(point.y, this.range, this.limits),
      point.x,
      point.y,
      (point.label ? point.label : ''),
      (point.color ? point.color : '#000')
    ));
  }

  /**
   * addDataPoints - add points onto the line
   *
   * @return {void}
   */
  addDataPoints() {
    this.points.map(point => {
      this.ctx.beginPath();
      this.ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
      this.ctx.fillStyle = ( this.params.points.color ? this.params.points.color : "#000" );
      this.ctx.fill();
      this.ctx.lineWidth = 1;
      this.ctx.strokeStyle = ( this.params.points.color ? this.params.points.color : "#000" );
      this.ctx.stroke();
    });
  }


  /**
   * addDataValues - add subscriptions to the datapoints - values (x,y)
   *
   * @return {void}
   */
  addDataValues() {
    this.points.map(point => {
      this.ctx.textAlign = "left";
      this.ctx.fillStyle = ( this.params.labels.color ? this.params.labels.color : "#000" );
      this.ctx.font = (this.params.labels.font ? this.params.labels.font : '');
      if (this.params.labels.type == "values") {
        this.ctx.fillText(
          `(${point.data_x},${point.data_y})`,
          point.x+10,
          point.y
        );
      } else if (this.params.labels.type == "x") {
        this.ctx.fillText(
          point.data_x,
          point.x+10,
          point.y
        );
      } else if (this.params.labels.type == "y") {
        this.ctx.fillText(
          point.data_y,
          point.x+10,
          point.y
        );
      } else if (this.params.labels.type == "label") {
        this.ctx.fillText(
          point.label,
          point.x+10,
          point.y
        );
      }
    });
  }
}
