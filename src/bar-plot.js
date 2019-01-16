import { DataPoint } from './data-point.js';
import { AbstractPlot } from './abstract-plot.js';
import { Converter } from './converter.js';

export class BarPlot extends AbstractPlot {
  /**
   * constructor - create a linear plot
   *
   * @param  {Element} canvas parent canvas element
   * @param  {object} plot   array of data points
   * @param  {object} range common range for the series of plots
   * @param  {object} limits common coords limits for the series of plots
   * @param  {bool} x_continuous is x-axis continuous (true) or categorical (false)
   * @param  {bool} y_continuous is y-axis continuous (true) or categorical (false)
   * @param  {object} options for all bar plots in series
   */
   constructor(canvas, plot, range, limits, x_continuous, y_continuous, global_options) {
     super(canvas, plot, range, limits, x_continuous, y_continuous);

     // this.limits = {...limits}; // unfortunally, it doesn't work in Enge
     this.limits = Object.assign({}, limits);
     this.options = global_options;
   }

   /**
    * render - render a bar plot
    *
    * @return {type}  description
    */
   render() {
     this.correctLimits();

     this.points = this.convertData();

     this.ctx = this.canvas.getContext("2d");

     this.plotBars();

     if (this.params.points) {
       this.addDataPoints();
     }

     if (this.params.labels) {
       this.addDataValues();
     }

     return this;
   }


   /**
    * plotBars - draw bars
    *
    * @return {void}
    */
   plotBars() {
     this.barWidth = this.calcBarWidth();

     this.points.map(
       point => this.drawBar(point)
     );
   }


   /**
    * drawBar - draw a single bar
    *
    * @param  {DataPoint} point point to draw a bar
    * @return {void}
    */
   drawBar(point) {
      if (this.params.bars.type == 'lines') {
        this.ctx.beginPath();
        this.ctx.strokeStyle = ( this.params.line.color ? this.params.line.color : "#000" );
        this.ctx.lineWidth = (this.params.line.width ? this.params.line.width : 1);
        this.ctx.moveTo(point.x, Converter.convertY(0, this.range, this.limits));
        this.ctx.lineTo(point.x, point.y);
        this.ctx.stroke();
      } else {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.globalAlpha = this.calcBarAlpha();
        this.ctx.strokeStyle = (this.params.bars.outline && this.params.bars.outline.color ? this.params.bars.outline.color : "#000" );
        this.ctx.lineWidth = (this.params.bars.outline && this.params.bars.outline.width ? this.params.bars.outline.width : 1 );
        this.ctx.moveTo(point.x, Converter.convertY(0, this.range, this.limits));
        this.ctx.lineTo(point.x + this.barWidth, Converter.convertY(0, this.range, this.limits));
        this.ctx.lineTo(point.x + this.barWidth, point.y);
        this.ctx.lineTo(point.x, point.y);
        this.ctx.lineTo(point.x, Converter.convertY(0, this.range, this.limits));
        this.ctx.stroke();
        if (this.params.bars.fill && this.params.bars.fill.type && this.params.bars.fill.type == 'fixed') {
          this.ctx.fillStyle = (this.params.bars.fill.color ? this.params.bars.fill.color : "#fff");
        } else {
          this.ctx.fillStyle = point.color;
        }
        this.ctx.fill();
        this.ctx.restore();
      }
   }


   /**
    * calcBarWidth - calculate width of bars
    *
    * @return {number}  bar width
    */
   calcBarWidth() {
     if (this.options.width) {
       return this.options.width;
     } else if (this.params.bars.width) {
       return this.params.bars.width;
     } else {
       return (this.limits.maxx - this.limits.minx) / this.data.length - (this.params.bars.gap ? this.params.bars.gap : 0)
     }
   }


   /**
    * calcBarAlpha - calculate alpha level for bar plot
    *
    * @return {number}  alpha value
    */
   calcBarAlpha() {
     if (this.options.alpha) {
       return this.options.alpha;
     } else if (this.params.bars.alpha) {
       return this.params.bars.alpha;
     } else {
       return 1;
     }
   }




   /**
    * correctLimits - correct given limits according bars position
    *
    * @return {void}
    */
   correctLimits() {
     if (this.options.position == 'separated') {
       let groupWidth = (this.limits.maxx - this.limits.minx) / this.options.count;
       this.limits.minx = this.limits.minx + groupWidth * this.options.index;
       this.limits.maxx = this.limits.minx + groupWidth;
     } if (this.options.position == 'together') {
       let barWidth = this.calcBarWidth();
       let shift
       this.limits.maxx = this.limits.maxx - barWidth * (this.options.count - this.options.index);
       this.limits.minx = this.limits.minx + barWidth * this.options.index;
     }
   }

}
