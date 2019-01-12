
/**
 * Calculate ranges according the series of plots
 */
export class Range {

  /**
   * constructor -
   *
   * @param  {type} series series of plots
   */
  constructor(series) {
    this.series = series;
  }


  /**
   * getRanges - get ranges for the serie of plots
   *
   * @return {array}  mix-max values for x-y entire the series
   */
  getRanges() {
    let ranges = this.series.map(
      plot => this.calcRange(plot)
    );

    return {
      'minx': Math.min(...ranges.map(point => point.minx)),
      'maxx': Math.min(...ranges.map(point => point.maxx)),
      'miny': Math.min(...ranges.map(point => point.miny)),
      'maxy': Math.min(...ranges.map(point => point.maxy))
    }
  }


  /**
   * calcRange - calculate min-max values on x-y for the plot
   *
   * @param  {array} plot plot description with data
   * @return {array}      min-max values for x-y
   */
  calcRange(plot) {
    if (plot.type == "linear") {
      return {
        'minx': Math.min(...plot.data.map(point => point.x)),
        'maxx': Math.max(...plot.data.map(point => point.x)),
        'miny': Math.min(...plot.data.map(point => point.y)),
        'maxy': Math.max(...plot.data.map(point => point.y))
      }
    }
  }


}
