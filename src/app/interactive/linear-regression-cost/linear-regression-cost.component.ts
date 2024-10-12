import { Component, OnInit } from '@angular/core';

import * as d3 from 'd3'

@Component({
  selector: 'app-linear-regression-cost',
  templateUrl: './linear-regression-cost.component.html',
  styleUrl: './linear-regression-cost.component.css'
})
export class LinearRegressionCostComponent implements OnInit {
 
  m: number = 2; // slope (default)
  b: number = 1; // intercept (default)

  private svg: any;
  private margin = {top: 20, right: 30, bottom: 30, left: 40};
  private width = 500 - this.margin.left - this.margin.right;
  private height = 300 - this.margin.top - this.margin.bottom;
  private xScale: any;
  private yScale: any;
  private line: any;


  ngOnInit(): void {
    this.svg = d3.select("div#graph")
      .append("svg")
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
    
    this.xScale = d3.scaleLinear().domain([0, 20]).range([0, this.width]);
    this.yScale = d3.scaleLinear().domain([0, 20]).range([this.height, 0]);

    // Append X and Y Axes
    this.svg.append("g")
      .attr("transform", "translate(0," + this.height + ")")
      .call(d3.axisBottom(this.xScale));

    this.svg.append("g")
      .call(d3.axisLeft(this.yScale));

    // Line generator
    this.line = d3.line<number>()
      .x((d, i) => this.xScale(i))
      .y((d, i) => this.yScale(this.m * i + this.b));

    // Append the line path
    this.svg.append("path")
      .datum(d3.range(0, 100))
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 5);
  }

  
  

  updateGraph(){
    this.svg.select(".line")
    .attr("d", () => this.line(d3.range(0, 100)));
  }
}
