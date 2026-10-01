---
title: "How does your CPU know when you click your mouse?"
excerpt: "A deep dive into how hardware interrupts (IRQs) and polling mechanisms inform your CPU and OS kernel the exact microsecond your mouse button is pressed."
date: "2025-01-20"
readingTime: "4 min read"
category: "Hardware & OS"
tags: ["CPU", "Interrupts", "Kernel", "Hardware", "OS"]
canonicalUrl: "https://kernel-thoughts.hashnode.dev/how-does-your-cpu-know-when-you-click-your-mouse"
featured: true
---

> *Published on Kernel Thoughts (Hashnode). Read original article at [kernel-thoughts.hashnode.dev](https://kernel-thoughts.hashnode.dev/how-does-your-cpu-know-when-you-click-your-mouse).*

Have you ever wondered what happens under the hood when your finger presses down on a mouse button? How does a physical mechanical switch translate into a cursor click on screen in milliseconds?

Your computer uses two primary mechanisms to detect peripheral input: **Hardware Interrupts** and **Polling**.

### 1. Hardware Interrupts (IRQ)

Many input controllers use an interrupt-driven system. When you click, the mechanical micro-switch closes an electrical circuit on the mouse PCB.

- **Signal Generation**: The mouse micro-controller detects the circuit completion and sends an electrical pulse down the USB/PS2 bus.
- **Interrupt Controller**: The I/O interrupt controller (APIC) raises a hardware interrupt request (IRQ) line to the CPU.
- **Context Switch**: The CPU immediately pauses its current execution cycle, saves register state to stack, and looks up the Interrupt Vector Table (IVT).
- **Interrupt Service Routine (ISR)**: The kernel executes the registered mouse driver ISR, reading raw packet bytes (buttons state, X/Y delta).

```
+----------------+      +-------------------+      +-------------------+
| Mouse Switch   | ---> | Interrupt Line    | ---> | CPU Interrupt ISR |
| (Physical)     |      | (Hardware IRQ)    |      | (Kernel Handler)  |
+----------------+      +-------------------+      +-------------------+
                                                             |
                                                             v
                                                   +-------------------+
                                                   | OS Window Manager |
                                                   | (GUI Click Event) |
                                                   +-------------------+
```

### 2. Polling

Alternatively, USB HID (Human Interface Device) protocol often uses high-frequency polling:

- **USB Host Controller**: The host controller repeatedly queries the mouse endpoint at regular intervals (e.g. 1000 Hz / every 1ms).
- **Buffer Inspection**: The CPU reads the endpoint buffer to check if any state changed since the last poll interval.
- While polling consumes minor CPU cycles, 1000 Hz polling provides ultra-low latency required by modern high-precision mice.

### From Hardware Signal to Desktop Event

Once the kernel processes raw bytes, it synthesizes a `MouseEvent` structure containing current cursor coordinates and button flags, passing it to the OS Window Manager (X11 / Wayland / Windows DWM) to trigger UI event listeners.
