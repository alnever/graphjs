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
        (this.x_continuous ? point.x : this.data.map(p => p.x).indexOf(point.x)),
        this.range, this.limits
      ),
      Converter.convertY(point.y, this.range, this.limits),
      point.x,
      point.y,
      (point.value ? point.value : 0),
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

    this.points.map(point => point.radius = this.calcPointRadius(point));

    let max_radius = Math.max(...this.points.map(point => point.radius));
    let radius_limit = Math.min(
      (this.limits.maxx - this.limits.minx) * .1,
      (this.limits.miny - this.limits.maxy) * .1
    );

    if (max_radius > radius_limit) {
      this.points.map(point => {
        point.radius = point.radius / max_radius * radius_limit;
      })
    }

    this.points.map(point => {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(point.x, point.y,
        point.radius,
        0, 2 * Math.PI
      );
      this.ctx.fillStyle = this.calcPointColor(point);
      this.ctx.lineWidth = (
        this.params.points
          && this.params.points.outline
          && this.params.points.outline.width ?
        this.params.points.outline.width : 1 );

      this.ctx.strokeStyle = (this.params.points
          && this.params.points.outline
          && this.params.points.outline.color ?
        this.params.points.outline.color : '#000');

      this.ctx.globalAlpha = (this.params.points && this.params.points.alpha ? this.params.points.alpha : 1);
      this.ctx.fill();
      this.ctx.stroke();
      this.ctx.restore();
    });
  }


  /**
   * addDataValues - add subscriptions to the datapoints - values (x,y)
   *
   * @return {void}
   */
  addDataValues() {

    this.points.map(point => {
      let labPoint = this.calcLabelPosition(point);

      this.ctx.textAlign = "left";
      this.ctx.fillStyle = ( this.params.labels.color ? this.params.labels.color : "#000" );
      this.ctx.font = (this.params.labels.font ? this.params.labels.font : '');
      if (this.params.labels.type == "xy") {
        this.ctx.fillText(
          `(${point.data_x},${point.data_y})`,
          labPoint.x,
          labPoint.y
        );
      } else if (this.params.labels.type == "value") {
        this.ctx.fillText(
          point.value,
          labPoint.x,
          labPoint.y
        );
      } else if (this.params.labels.type == "x") {
        this.ctx.fillText(
          point.data_x,
          labPoint.x,
          labPoint.y
        );
      } else if (this.params.labels.type == "y") {
        this.ctx.fillText(
          point.data_y,
          labPoint.x,
          labPoint.y
        );
      } else if (this.params.labels.type == "label") {
        this.ctx.fillText(
          point.label,
          labPoint.x,
          labPoint.y
        );
      }
    });
  }


  /**
   * calcPointRadius - calculate radius of data points
   * @param {object} point - data point
   *
   * @return {number}  radius of the point
   */
  calcPointRadius(point) {
    let radius = point.data_y;
    if (this.params.points.radius) {
      if (this.params.points.radius.type && this.params.points.radius.type == 'fixed') {
        radius = (this.params.points.radius.value ? this.params.points.radius.value : 0);
      } else if (this.params.points.radius.type && this.params.points.radius.type == 'y') {
        radius = point.data_y;
      } else if (this.params.points.radius.type && this.params.points.radius.type == 'value') {
        radius =  point.value;
      }
    }
    return radius;
  }


  /**
   * calcPointColor - calculate point color
   *
   * @param  {object} point data point
   * @return {string}       color value
   */
  calcPointColor(point) {
    if (this.params.points.color) {
      if (this.params.points.color.type && this.params.points.color.type == 'fixed') {
        return (this.params.points.color.color ? this.params.points.color.color : "#000");
      } else {
        return point.color;
      }
    }
  }


  /**
   * calcLabelPosition - calc position of label
   *
   * @param  {object} point current point coords
   * @return {object}         position of the label
   */
  calcLabelPosition(point) {
    let position = Object.assign({}, point);
    if (this.params.labels && this.params.labels.position) {
      switch (this.params.labels.position) {
        case ("left") : {
          position.x -= 5;
          break;
        }
        case ("right") : {
          position.x += 5;
          break;
        }
        case ("top") : {
          position.y -= 5;
          break;
        }
        case ("botton") : {
          position.y += 5;
          break;
        }
      }
    }

    return position;
  }
}
