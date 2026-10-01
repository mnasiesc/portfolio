---
title: "What happens when you click your PC's power button?"
excerpt: "Tracing the hardware journey from closing an electrical circuit on your motherboard, through PSU voltage regulation, POST hardware checks, and UEFI bootloader handover to the OS kernel."
date: "2024-12-10"
readingTime: "4 min read"
category: "Hardware & OS"
tags: ["Hardware", "BIOS", "UEFI", "Kernel", "Boot Sequence"]
canonicalUrl: "https://kernel-thoughts.hashnode.dev/what-happens-when-you-click-your-pc-s-power-button"
featured: true
---

> *Published on Kernel Thoughts (Hashnode). Read original article at [kernel-thoughts.hashnode.dev](https://kernel-thoughts.hashnode.dev/what-happens-when-you-click-your-pc-s-power-button).*

Pressing the front-panel power button on your PC isn't a software action—it is a physical electrical event that initiates the entire system boot sequence.

### The 4-Stage Power Boot Sequence

```
+------------------+      +------------------+      +------------------+
| 1. Short Circuit | ---> | 2. PSU Power-OK  | ---> | 3. UEFI / POST   |
| (Front Panel)    |      | (Voltage Stable) |      | (Hardware Test)  |
+------------------+      +------------------+      +------------------+
                                                               |
                                                               v
                                                    +------------------+
                                                    | 4. OS Bootloader |
                                                    | (Kernel Handover)|
                                                    +------------------+
```

#### 1. Closing the Front Panel Circuit

When you press the power button, you temporarily bridge two header pins on your motherboard (`PWR_BTN` and `GND`). This sends a momentary active-low signal to the Super I/O chip or Embedded Controller (EC).

#### 2. PSU Activation & Power-OK Signal

The EC pulls the `PS_ON#` line down to ground, telling the Power Supply Unit (PSU) to turn on main rails (+12V, +5V, +3.3V). Once voltages stabilize, the PSU sends a `POWER_OK` (or `PWR_GOOD`) signal back to the motherboard.

#### 3. CPU Reset & Firmware Execution (BIOS / UEFI)

Receiving `POWER_OK` releases the CPU reset line. The CPU initializes in real mode (or 64-bit flat mode on modern x86_64 chips) and executes its first instruction at the reset vector (`0xFFFFFFF0`), jumping to UEFI firmware stored in SPI flash memory.

1. **POST (Power-On Self-Test)**: Validates RAM integrity, GPU initialization, and peripheral buses.
2. **Boot Device Selection**: Reads the EFI System Partition (ESP) formatted as FAT32.

#### 4. OS Kernel Handover

The UEFI firmware loads the bootloader executable (e.g. `systemd-boot`, `GRUB`, or Windows Boot Manager). The bootloader loads the kernel image (`vmlinuz`) and `initramfs` into RAM, invokes `start_kernel()`, and transfers total control to the operating system.

---

*Note: Holding the power button for 4–5 seconds forces the EC to cut `PS_ON#` immediately, performing a hard shutdown that bypasses OS filesystem sync callbacks.*
