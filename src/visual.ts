/*
 *  Power BI Visual CLI
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 *  Attribution: Original Source code from: https://github.com/mprozil/PlayAxis
 */

module powerbi.extensibility.visual {
    /**
    * Interface for viewmodel.
    *
    * @interface
    * @property {CategoryDataPoint[]} dataPoints - Set of data points the visual will render.
    */
    interface ViewModel {
        dataPoints: CategoryDataPoint[];
        settings: VisualSettings;
    };

    /**
     * Interface for data points.
     *
     * @interface
     * @property {string} category          - Corresponding category of data value.
     * @property {ISelectionId} selectionId - Id assigned to data point for cross filtering
     *                                        and visual interaction.
     */
    interface CategoryDataPoint {
        category: string;
        selectionId: ISelectionId;
    };

    /**
     * Interface for VisualChart settings.
     *
     * @interface
     * @property {{autoStart:boolean}} transitionSettings - Object property to enable or disable auto start option.
     * @property {{loop:boolean}} transitionSettings - Object property to enable or disable loop option.
     * @property {{timeInterval:number}} transitionSettings - Object property that allows setting the time between transitions.
     * @property {{pickedColor:Fill}} colorSelector - Object property that allows setting the control buttons color.
     * @property {{showAll:boolean}} colorSelector - Object property to enable or disable individual colors.
     * @property {{playColor:Fill}} colorSelector - Object property that allows setting the color for play button.
     * @property {{pauseColor:Fill}} colorSelector - Object property that allows setting the color for pause button.
     * @property {{stopColor:Fill}} colorSelector - Object property that allows setting the color for stop button..
     * @property {{previousColor:Fill}} colorSelector - Object property that allows setting the color the previous button.
     * @property {{nextColor:Fill}} colorSelector - Object property that allows setting the color for next button.
     * @property {{show:boolean}} captionSettings - Object property that allows axis to be enabled.
     * @property {{captionColor:Fill}} captionSettings - Object property that allows setting the caption buttons.
     * @property {{fontSize:number}} captionSettings - Object property that allows setting the caption font size.
     */
    interface VisualSettings {
        transitionSettings: {
            autoStart: boolean;
            loop: boolean;
            timeInterval: number;
        };
        colorSelector: {
            pickedColor: Fill;
            showAll: boolean;
            playColor: Fill;
            pauseColor: Fill;
            stopColor: Fill;
            previousColor: Fill;
            nextColor: Fill;
        };
        captionSettings: {
            show: boolean;
            captionColor: Fill;
            fontSize: number;
            align: string;
        };
    }

    /**
     * Function that converts queried data into a view model that will be used by the visual.
     *
     * @function
     * @param {VisualUpdateOptions} options - Contains references to the size of the container
     *                                        and the dataView which contains all the data
     *                                        the visual had queried.
     * @param {IVisualHost} host            - Contains references to the host which contains services
     */
    function visualTransform(options: VisualUpdateOptions, host: IVisualHost): ViewModel {
        let dataViews = options.dataViews;

        let defaultSettings: VisualSettings = {
            transitionSettings: {
                autoStart: false,
                loop: false,
                timeInterval: 5,
            },
            colorSelector: {
                pickedColor: { solid: { color: "#000000" } },
                showAll: false,
                playColor: { solid: { color: "#44AE35" } },
                pauseColor: { solid: { color: "#E9CA21" } },
                stopColor: { solid: { color: "#C52C1D" } },
                previousColor: { solid: { color: "#3F48CC" } },
                nextColor: { solid: { color: "#00A2E8" } },
            },
            captionSettings: {
                show: true,
                captionColor: { solid: { color: "#000000" } },
                fontSize: 16,
                align: "left",
            }
        };

        let categorical = dataViews[0].categorical;
        let category = categorical.categories[0];

        let categoryDataPoints: CategoryDataPoint[] = [];

        let colorPalette: IColorPalette = host.colorPalette;
        let objects = dataViews[0].metadata.objects;

        let visualSettings: VisualSettings = {
            transitionSettings: {
                autoStart: getValue<boolean>(objects, 'transitionSettings', 'autoStart', defaultSettings.transitionSettings.autoStart),
                loop: getValue<boolean>(objects, 'transitionSettings', 'loop', defaultSettings.transitionSettings.loop),
                timeInterval: getValue<number>(objects, 'transitionSettings', 'timeInterval', defaultSettings.transitionSettings.timeInterval),
            },
            colorSelector: {
                pickedColor: getValue<Fill>(objects, 'colorSelector', 'pickedColor', defaultSettings.colorSelector.pickedColor),
                showAll: getValue<boolean>(objects, 'colorSelector', 'showAll', defaultSettings.colorSelector.showAll),
                playColor: getValue<Fill>(objects, 'colorSelector', 'playColor', defaultSettings.colorSelector.playColor),
                pauseColor: getValue<Fill>(objects, 'colorSelector', 'pauseColor', defaultSettings.colorSelector.pauseColor),
                stopColor: getValue<Fill>(objects, 'colorSelector', 'stopColor', defaultSettings.colorSelector.stopColor),
                previousColor: getValue<Fill>(objects, 'colorSelector', 'previousColor', defaultSettings.colorSelector.previousColor),
                nextColor: getValue<Fill>(objects, 'colorSelector', 'nextColor', defaultSettings.colorSelector.nextColor),
            },
            captionSettings: {
                show: getValue<boolean>(objects, 'captionSettings', 'show', defaultSettings.captionSettings.show),
                captionColor: getValue<Fill>(objects, 'captionSettings', 'captionColor', defaultSettings.captionSettings.captionColor),
                fontSize: getValue<number>(objects, "captionSettings", "fontSize", defaultSettings.captionSettings.fontSize),
                align: getValue<string>(objects, "captionSettings", "align", defaultSettings.captionSettings.align),
            }
        }

        for (let i = 0, len = Math.max(category.values.length); i < len; i++) {
            categoryDataPoints.push({
                category: category.values[i] + '',
                selectionId: host.createSelectionIdBuilder()
                    .withCategory(category, i)
                    .createSelectionId()
            });
        }

        return {
            dataPoints: categoryDataPoints,
            settings: visualSettings,
        };
    }

    /**
     * Function that checks if data is ready to be used by the visual.
     *
     * @function
     * @param {VisualUpdateOptions} options - Contains references to the size of the container
     *                                        and the dataView which contains all the data
     *                                        the visual had queried.
     */
    function isDataReady(options: VisualUpdateOptions) {
        if (!options
            || !options.dataViews
            || !options.dataViews[0]
            || !options.dataViews[0].categorical
            || !options.dataViews[0].categorical.categories
            || !options.dataViews[0].categorical.categories[0].source) {
            return false;
        }

        return true;
    }

    enum Status { Play, Pause, Stop }

    export class Visual implements IVisual {
        private host: IVisualHost;
        private selectionManager: ISelectionManager;
        private svg: d3.Selection<SVGElement>;
        private controlsSVG: d3.Selection<SVGElement>;
        private captionSVG: d3.Selection<SVGElement>;
        private visualDataPoints: CategoryDataPoint[];
        private visualSettings: VisualSettings;
        private status: Status;
        private lastSelected: number;
        private viewModel: ViewModel;
        private timers: any;

        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            this.selectionManager = options.host.createSelectionManager();
            this.status = Status.Stop;
            this.timers = [];
            this.lastSelected = 0;

            let buttonNames = ["play", "pause", "stop", "previous", "next"];

            let buttonPath = [
                "M3.2,32c-0.585,0-1.169-0.16-1.684-0.478C0.576,30.938,0,29.91,0,28.8V3.2 C0,2.089,0.576,1.06,1.517,0.477C2.031,0.163,2.615,0,3.2,0c0.486,0,0.981,0.112,1.431,0.336l25.6,12.8 C31.314,13.68,32,14.787,32,16s-0.686,2.323-1.77,2.864l-25.6,12.801C4.182,31.888,3.687,32,3.2,32z",
                "M28.8,32H22.4c-1.771,0-3.2-1.431-3.2-3.2V3.2c0-1.77,1.43-3.2,3.2-3.2H28.8 c1.77,0,3.2,1.43,3.2,3.2v25.6C32,30.569,30.569,32,28.8,32z M9.6,32H3.2C1.43,32,0,30.569,0,28.8V3.2C0,1.43,1.43,0,3.2,0H9.6 c1.77,0,3.2,1.43,3.2,3.2v25.6C12.8,30.569,11.369,32,9.6,32z",
                "M3.2,0h25.6c1.77,0,3.2,1.43,3.2,3.2v25.6c0,1.77-1.431,3.2-3.2,3.2H3.2C1.43,32,0,30.569,0,28.8 V3.2C0,1.43,1.43,0,3.2,0z",
                "M30.592,29.019c-0.866,0.463-1.92,0.413-2.736-0.134l-16-10.667 c-0.744-0.496-1.189-1.328-1.189-2.219c0-0.894,0.445-1.723,1.188-2.219l16-10.667c0.818-0.544,1.869-0.597,2.736-0.133 S32,4.349,32,5.333v21.333C32,27.651,31.458,28.551,30.592,29.019z M8,29.333H2.666C1.191,29.333,0,28.141,0,26.667V5.333 c0-1.475,1.191-2.667,2.666-2.667H8c1.475,0,2.666,1.192,2.666,2.667V16v10.667C10.666,28.141,9.475,29.333,8,29.333z",
                "M1.408,29.019C0.541,28.551,0,27.651,0,26.667V5.333c0-0.984,0.544-1.888,1.41-2.352 C2.277,2.517,3.328,2.57,4.146,3.114l16,10.667c0.741,0.496,1.187,1.325,1.187,2.219c0,0.891-0.445,1.723-1.188,2.219l-16,10.667 C3.328,29.432,2.275,29.482,1.408,29.019z M24,29.333c-1.475,0-2.667-1.191-2.667-2.666V16V5.333c0-1.475,1.192-2.667,2.667-2.667 h5.333C30.809,2.666,32,3.858,32,5.333v21.333c0,1.475-1.191,2.666-2.667,2.666H24z"
            ]

            this.svg = d3.select(options.element).append("svg")
                .attr("width", "100%")
                .attr("height", "100%");

            this.controlsSVG = this.svg.append('svg');
            for (let i = 0; i < buttonNames.length; ++i) {
                let container = this.controlsSVG.append('g')
                    .attr('class', "controls")
                    .attr('transform', 'translate(' + 40 * i + ' 5) scale(0.9)')
                    .attr('id', buttonNames[i]);
                container.append("path")
                    .attr("d", buttonPath[i]);
            }

            //Append caption text
            this.captionSVG = this.svg.append('svg').attr("width", "100%");
            let captionBox = this.captionSVG.append('g').attr("transform", "translate(0, 40)");
            captionBox.append('text')
                .attr('dominant-baseline', 'middle')
                .attr("y", "0")
                .attr('id', 'label');

            //Events on click
            this.svg.select("#play").on("click", () => {
                this.playAnimation();
            });
            this.svg.select("#stop").on("click", () => {
                this.stopAnimation();
            });
            this.svg.select("#pause").on("click", () => {
                this.pauseAnimation();
            });
            this.svg.select("#previous").on("click", () => {
                this.step(-1);
            });
            this.svg.select("#next").on("click", () => {
                this.step(1);
            });
        }

        public update(options: VisualUpdateOptions) {
            if (isDataReady(options) == false) {
                return;
            }

            this.stopAnimation();
            let viewModel = this.viewModel = visualTransform(options, this.host);
            this.visualSettings = viewModel.settings;
            this.visualDataPoints = viewModel.dataPoints;

            //Start playing without click
            if (this.visualSettings.transitionSettings.autoStart) {
                this.playAnimation();
            }

            //Change colors
            if (this.visualSettings.colorSelector.showAll) {
                let playColor = viewModel.settings.colorSelector.playColor.solid.color;
                let pauseColor = viewModel.settings.colorSelector.pauseColor.solid.color;
                let stopColor = viewModel.settings.colorSelector.stopColor.solid.color;
                let previousColor = viewModel.settings.colorSelector.previousColor.solid.color;
                let nextColor = viewModel.settings.colorSelector.nextColor.solid.color;
                this.svg.selectAll("#play").attr("fill", viewModel.settings.colorSelector.playColor.solid.color);
                this.svg.selectAll("#pause").attr("fill", viewModel.settings.colorSelector.pauseColor.solid.color);
                this.svg.selectAll("#stop").attr("fill", viewModel.settings.colorSelector.stopColor.solid.color);
                this.svg.selectAll("#previous").attr("fill", viewModel.settings.colorSelector.previousColor.solid.color);
                this.svg.selectAll("#next").attr("fill", viewModel.settings.colorSelector.nextColor.solid.color);
            } else {
                let pickedColor = viewModel.settings.colorSelector.pickedColor.solid.color;
                this.svg.selectAll(".controls").attr("fill", viewModel.settings.colorSelector.pickedColor.solid.color);
            }
            let captionColor = viewModel.settings.captionSettings.captionColor.solid.color;
            this.svg.select("#label").attr("fill", captionColor);

            //Change caption font size
            let fontSize = viewModel.settings.captionSettings.fontSize;
            this.svg.select("#label").attr("font-size", fontSize);

            let myViewBox = options.viewport;

            //Change title
            if (this.visualSettings.captionSettings.show) {
                let title = options.dataViews[0].categorical.categories[0].source.displayName;
                this.svg.select("#label").text(title);
                let textWidth = parseInt(this.svg.select("#label").text(title).style("width"));
                let viewBoxWidth = 245 + textWidth;
                this.controlsSVG
                    .attr("viewBox", "0 0 " + viewBoxWidth + " 24")
                    .attr('preserveAspectRatio', 'xMinYMin');

                this.captionSVG.select("text") //.attr('text-anchor', 'left');
                this.captionSVG.attr("viewBox", "0 0 195 24").attr('preserveAspectRatio', 'xMinYMin');
                this.captionSVG.style('background-color', '#ccc');
            } else {
                this.svg.select("#label").text("");
                this.controlsSVG
                    .attr("viewBox", "0 0 195 24")
                    .attr('preserveAspectRatio', 'xMinYMin');
            }
        }

        public playAnimation() {
            if (this.status == Status.Play) return;

            this.svg.selectAll("#play, #next, #previous").attr("opacity", "0.3");
            this.svg.selectAll("#stop, #pause").attr("opacity", "1");

            let timeInterval = this.viewModel.settings.transitionSettings.timeInterval;
            let startingIndex = this.status == Status.Stop ? 0 : this.lastSelected + 1;
            let millitosecs = 1000;

            for (let i = startingIndex; i < this.viewModel.dataPoints.length; ++i) {
                let timer = setTimeout(() => {
                    this.selectionManager.select(this.viewModel.dataPoints[i].selectionId);
                    this.lastSelected = i;
                    this.updateCaption(this.viewModel.dataPoints[i].category);
                }, (i - this.lastSelected) * (timeInterval * millitosecs));
                this.timers.push(timer);
            }

            //replay or stop after one cicle
            let stopAnimationTimer = setTimeout(() => {
                if (this.visualSettings.transitionSettings.loop) {
                    this.status = Status.Stop;
                    this.lastSelected = 0;
                    this.playAnimation();
                } else {
                    this.stopAnimation();
                }
            }, (this.viewModel.dataPoints.length - this.lastSelected) * (timeInterval * millitosecs));
            this.timers.push(stopAnimationTimer);
            this.status = Status.Play;
        }

        public stopAnimation() {
            if (this.status == Status.Stop) return;

            this.svg.selectAll("#pause, #stop, #next, #previous").attr("opacity", "0.3");
            this.svg.selectAll("#play").attr("opacity", "1");
            for (let i of this.timers) {
                clearTimeout(i);
            }
            this.updateCaption("");
            this.lastSelected = 0;
            this.selectionManager.clear();
            this.status = Status.Stop;
        }

        public pauseAnimation() {
            if (this.status == Status.Pause || this.status == Status.Stop) return;

            this.svg.selectAll("#pause").attr("opacity", "0.3");
            this.svg.selectAll("#play, #stop, #next, #previous").attr("opacity", "1");
            for (let i of this.timers) {
                clearTimeout(i);
            }
            this.status = Status.Pause;
        }

        public step(step: number) {
            if (this.status == Status.Play || this.status == Status.Stop) return;

            //Check if selection is within limits
            if ((this.lastSelected + step) < 0 || (this.lastSelected + step) > (this.viewModel.dataPoints.length - 1)) return;

            this.lastSelected = this.lastSelected + step;
            this.selectionManager.select(this.viewModel.dataPoints[this.lastSelected].selectionId);
            this.updateCaption(this.viewModel.dataPoints[this.lastSelected].category);
            this.status = Status.Pause;
        }

        public updateCaption(caption: string) {
            if (this.visualSettings.captionSettings.show) {
                this.svg.select("#label").text(caption);
            }
        }
        /**
         * Enumerates through the objects defined in the capabilities and adds the properties to the format pane
         *
         * @function
         * @param {EnumerateVisualObjectInstancesOptions} options - Map of defined objects
         */
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            let objectName = options.objectName;
            let objectEnumeration: VisualObjectInstance[] = [];

            switch (objectName) {
                case 'transitionSettings':
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            autoStart: this.visualSettings.transitionSettings.autoStart,
                            loop: this.visualSettings.transitionSettings.loop,
                            timeInterval: this.visualSettings.transitionSettings.timeInterval
                        },
                        validValues: {
                            timeInterval: {
                                numberRange: {
                                    min: 1,
                                    max: 60
                                }
                            }
                        },
                        selector: null
                    });
                    break;
                case 'colorSelector':
                    if (this.visualSettings.colorSelector.showAll) {
                        objectEnumeration.push({
                            objectName: objectName,
                            properties: {
                                showAll: this.visualSettings.colorSelector.showAll,
                                playColor: {
                                    solid: {
                                        color: this.visualSettings.colorSelector.playColor.solid.color
                                    }
                                },
                                pauseColor: {
                                    solid: {
                                        color: this.visualSettings.colorSelector.pauseColor.solid.color
                                    }
                                },
                                stopColor: {
                                    solid: {
                                        color: this.visualSettings.colorSelector.stopColor.solid.color
                                    }
                                },
                                previousColor: {
                                    solid: {
                                        color: this.visualSettings.colorSelector.previousColor.solid.color
                                    }
                                },
                                nextColor: {
                                    solid: {
                                        color: this.visualSettings.colorSelector.nextColor.solid.color
                                    }
                                }
                            },
                            selector: null
                        });
                    } else {
                        objectEnumeration.push({
                            objectName: objectName,
                            properties: {
                                showAll: this.visualSettings.colorSelector.showAll,
                                pickedColor: {
                                    solid: {
                                        color: this.visualSettings.colorSelector.pickedColor.solid.color
                                    }
                                }
                            },
                            selector: null
                        });
                    }
                    break;
                case 'captionSettings':
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            show: this.visualSettings.captionSettings.show,
                            captionColor: {
                                solid: {
                                    color: this.visualSettings.captionSettings.captionColor.solid.color
                                }
                            },
                            fontSize: this.visualSettings.captionSettings.fontSize
                        },
                        selector: null
                    });
                    break;
            };
            return objectEnumeration;
        }
    }
}
