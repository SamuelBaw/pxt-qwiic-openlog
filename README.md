# Data Logger SparkFun Qwiic OpenLog
 This micro:bit extension is based on spark-fun gator:log extension https://github.com/sparkfun/pxt-gator-log. The extension was changed in the following points:
* functions added, to write CSV files to the SD card
* functions added, to write time and date columns automatically
* communication protocol changed to I2C support
* functions added to split string to allow sending larger strings than I2C allows

The SparkFun Qwiic OpenLog can be used to write data to an SD card using a I2C connection.

![15164-SparkFun_Qwiic_OpenLog-01](https://github.com/SamuelBaw/pxt-qwiic-openlog/assets/104888073/1996a771-da1c-4b05-9ba3-a1e3b531b488)

## Usage (Software)
To use this package, go to https://makecode.microbit.org, click ``Add package`` and insert the following link to this repository: https://github.com/SamuelBaw/pxt-qwiic-openlog.git

## Usage (Hardware)
Connection:
| gator:log | micro:bit |
|-----------|-----------|
| GND       | GND       |
| 3V3       | 3V3       |
| SDA       | SDA        |
| SCL       | SCL       |

## Example: Basic Functionality Test
```blocks
if (openLog.begin()) {
    basic.showIcon(IconNames.Yes)
} else {
    basic.showIcon(IconNames.No)
}
openLog.setDateAndTime(
2023,
9,
13,
9,
0
)
openLog.mkDirectory("home")
openLog.chDirectory("home")
openLog.openCSVFile("tempLightLog")
basic.forever(function () {
    openLog.writeRowWithTextToCSV(["temp", "light"], HeaderLine.YES)
    openLog.writeRowWithNumbersToCSV([input.temperature(), input.lightLevel()], HeaderLine.NO)
    basic.pause(1000)
})



```

## Supported targets
* MicroBit V2.0
* for PXT/microbit
