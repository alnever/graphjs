
/**
 * Calculate ranges according the series of plots
 */
export class Range {

  /**
   * constructor -
   *
   * @param  {type} series series of plots
   */
  constructor(series, x_continuous, y_continuous) {
    this.series = series;
    this.x_continuous = x_continuous;
    this.y_continuous = y_continuous;
  }


  /**
   * getRanges - get ranges for the serie of plots
   *
   * @return {object}  mix-max values for x-y entire the series
   */
  getRanges() {
    let ranges = this.series.map(
      plot => this.calcRange(plot)
    );

    return {
      'minx': Math.min(...ranges.map(point => point.minx),0),
      'maxx': Math.max(...ranges.map(point => point.maxx),0),
      'miny': Math.min(...ranges.map(point => point.miny),0),
      'maxy': Math.max(...ranges.map(point => point.maxy),0)
    }
  }


  /**
   * calcRange - calculate min-max values on x-y for the plot
   *
   * @param  {object} plot plot description with data
   * @return {object}      min-max values for x-y
   */
  calcRange(plot) {
      return {
        'minx': (this.x_continuous ?
          Math.min(...plot.data.map(point => point.x)) : 0
        ),
        'maxx': (this.x_continuous ?
          Math.max(...plot.data.map(point => point.x)) : plot.data.length
        ),
        'miny': (this.y_continuous ?
          Math.min(...plot.data.map(point => point.y)) : 0
        ),
        'maxy': (this.y_continuous ?
          Math.max(...plot.data.map(point => point.y)) : plot.data.length
        )
      }
  }
}
