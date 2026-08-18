import React from "react";
import { mountCanvas } from "@thisismydesign/cursor-canvas-web/runtime";

import "@mantine/core/styles.css";
import "@mantine/charts/styles.css";

import Canvas from "./canvas.canvas.tsx";

mountCanvas("root", <Canvas />);
