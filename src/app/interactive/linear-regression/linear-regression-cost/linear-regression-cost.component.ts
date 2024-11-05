import { Component, Input, OnInit } from '@angular/core';

import * as d3 from 'd3'

@Component({
  selector: 'app-linear-regression-cost',
  templateUrl: './linear-regression-cost.component.html',
  styleUrl: './linear-regression-cost.component.css'
})
export class LinearRegressionCostComponent implements OnInit {
  @Input() data: any = [[5, 10], [10, 12], [15, 8], [20, 14]]; // Example data points
  ;

  m = 2; // slope (default)
  b = 1; // intercept (default)

  private svg: any;
  private margin = {top: 20, right: 30, bottom: 30, left: 40};
  private width = 500 - this.margin.left - this.margin.right;
  private height = 300 - this.margin.top - this.margin.bottom;
  private xScale: any;
  private yScale: any;
  private line: any;
  public cost!: number;

  private rotation = 0;


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
      .attr("stroke", "#B534FF")
      .attr("stroke-width", 3);


    this.svg.selectAll("dot")
      .data(this.data)
      .enter()
      .append("circle")
      .attr("cx", (d: any[]) => this.xScale(d[0])) // X coordinate scaled by xScale
      .attr("cy", (d: any[]) => this.yScale(d[1])) // Y coordinate scaled by yScale
      .attr("r", 5) // Radius of the scatter point
      .attr("fill", "#4EFFEF"); // Color of the scatter points
  }

  updateGraph(){
    this.svg.select(".line")
    .attr("d", () => this.line(d3.range(0, 100)));

    // Bind the data to the existing lines
    const lines = this.svg.selectAll(".scatter-line")
    .data(this.data);

    // Remove lines for removed data points
    lines.exit().remove();

    // Enter selection: Append new lines for new data points
    lines.enter()
      .append("line")
      .attr("class", "scatter-line")
      .attr("stroke", "#4EFFEF")
      .attr("stroke-width", 3)
      .merge(lines) // Update selection: Update existing lines and newly added ones
      .attr("x1", (d: any[]) => this.xScale(d[0])) // X coordinate for the scatter point
      .attr("y1", (d: any[]) => this.yScale(d[1])) // Y coordinate for the scatter point
      .attr("x2", (d: any[]) => this.xScale(d[0])) // X coordinate remains the same for both scatter and line
      .attr("y2", (d: any[]) => this.yScale(this.m * d[0] + this.b)); // Y coordinate on the main line (using y = mx + b)

      this.calculateCost()
  }


  calculateCost(){
    let cost = 0
    for(let i=0; i<this.data.length; i++){
      const predicted = this.m * this.data[i][0] + this.b
      const actual = this.data[i][1]

      console.log("\n")
      console.log("PREDICTED ", predicted);
      console.log("ACTUAL ", actual)

      cost += (predicted - actual) ** 2
    }

    cost = cost / (2 * this.data.length)
    this.cost = cost
    console.log("TOTAL COST: ", cost)
  }
}
