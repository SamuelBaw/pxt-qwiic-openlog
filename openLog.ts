/**
* Andy England @ SparkFun Electronics
* September 6, 2018
* Development environment specifics:
* Written in Microsoft Makecode
* Tested with a SparkFun gatorlog sensor and micro:bit
*
* This code is released under the [MIT License](http://opensource.org/licenses/MIT).
* Please review the LICENSE.md file included with this example. If you have any questions
* or concerns with licensing, please contact techsupport@sparkfun.com.
* Distributed as-is; no warranty is given.
*/

/* adapted to work with Qwiic OpenLog board"


/**
 * Functions to operate the Qwiic OpenLog board
 */

enum ReturnDataType {
    Ascii = 1,
    Hexadecimal = 2,
    Raw = 3
}

enum HeaderLine {
    YES = 1,
    NO = 0,
}

const ADDR = 0x2A

enum RegisterMap {
    id = 0x00,
    status = 0x01,
    firmwareMajor = 0x02,
    firmwareMinor = 0x03,
    i2cAddress = 0x1E,
    logInit = 0x05,
    createFile = 0x06,
    mkDir = 0x07,
    cd = 0x08,
    readFile = 0x09,
    startPosition = 0x0A,
    openFile = 0x0B,
    writeFile = 0x0C,
    fileSize = 0x0D,
    list = 0x0E,
    rm = 0x0F,
    rmrf = 0x10,
    syncFile = 0x11,

}

//% color=#f44242 
//% icon="\uf0ce"
//% groups=['init', 'filesystem' ,'textfile', 'csv']
namespace openLog {
    // Functions for reading Particle from the gatorlog in Particle or straight adv value

    let commandMode = 0
    let currentFile = ""
    let carriageReturn = String.fromCharCode(13)
    let newLine = String.fromCharCode(10)
    let commandReady = ">"
    let writeReady = "<"
    let rowCounter = 0

    //The only reason we have this function is so we don't set currentFile to DELETEME.txt
    function dummyFile() {

        //basa
        let buf: Buffer = pins.createBuffer(1);
        buf[0] = ADDR;
        pins.i2cWriteBuffer(ADDR, buf, false);
        buf = pins.i2cReadBuffer(ADDR, 1, false);
        //basa

        command()
        serial.writeString("append DELETEME.txt" + carriageReturn)
        serial.readUntil(writeReady)
        basic.pause(20)
        commandMode = 0;
        removeItem("DELETEME.txt")
        return
    }

    function command() {
        if (commandMode == 0) {
            serial.writeString(String.fromCharCode(26) + String.fromCharCode(26) + String.fromCharCode(26))
            serial.readUntil(commandReady)
            basic.pause(20)
            commandMode = 1
        }
        return
    }

    function sendCommand(registerNumber: number, optionalString: string) {

        if (optionalString.length > 0) {
            let stringBuf: Buffer = pins.createBuffer(optionalString.length);
            let sendBuf: Buffer = pins.createBuffer(optionalString.length + 1);
            sendBuf[0] = registerNumber;
            stringBuf = Buffer.fromUTF8(optionalString);
            sendBuf.write(1, stringBuf);
            pins.i2cWriteBuffer(ADDR, sendBuf, false);

        }
        else {
            let sendBuf: Buffer = pins.createBuffer(1);
            sendBuf[0] = registerNumber;
            pins.i2cWriteBuffer(ADDR, sendBuf, false);
        }
    }

    function resetHardware(RST_pin: DigitalPin) {
        pins.digitalWritePin(RST_pin, 1)
        basic.pause(100)
        pins.digitalWritePin(RST_pin, 0)
        basic.pause(100)
        pins.digitalWritePin(RST_pin, 1)
    }

    function beginGeneric() {
        basic.pause(2500)
        //resetHardware(RST_pin)  - not used
        //serial.readUntil(writeReady)
        //basic.pause(20)
        dummyFile()
        return
    }

    /**
    * Initializes gator:log and waits until it says it is ready to be written to.
    */
    //% weight=68 
    //% blockId="openLog_begin" 
    //% block="initialize gator:log"
    //% group="init"
    export function begin() {
        beginGeneric()
    }


    /**
    * Initializes date and time
    */
    //% weight=59 
    //% blockId="openLog_set_Date" 
    //% block="sets date and time with year %year, month %month, day %day, hour %hour, minute %minute"
    //% group="csv"
    export function setDateAndTime(year: number = 2021, month: number = 1, day: number = 1, hour: number = 0, minute: number = 0) {
        rowCounter = 0
        timeanddate.TimeFormat.HHMM24hr
        timeanddate.set24HourTime(hour, minute, 0)
        timeanddate.setDate(month, day, year)
        return
    }

    /**
    * Opens the file with the name provided (don't forget to provide an extension). If the file does not exist, it is created.
    */
    //% weight=58
    //% blockId="openLog_openFile"
    //% block="open file named %value"
    //% group="textfile"
    export function openFile(value: string) {
        command()
        serial.writeString("append " + value + carriageReturn)
        serial.readUntil(writeReady)
        basic.pause(20)
        currentFile = value
        commandMode = 0;
        return
    }

    /**
    * Removes the file with the provided name
    */
    //% weight=47
    //% blockId="openLog_removeItem"
    //% block="remove file %value"
    //% group="filesystem"
    export function removeItem(value: string) {
        command()
        serial.writeString("rm " + value + carriageReturn)
        serial.readUntil(commandReady)
        basic.pause(20)
        return
    }

    /**
    * Creates a folder. Note that this block does not open the folder that it creates
    */
    //% weight=49
    //% blockId="openLog_mkDirectory"
    //% block="create folder with name %value"
    //% group="filesystem"
    export function mkDirectory(value: string) {
        sendCommand(RegisterMap.mkDir, value);
        basic.pause(20)
        return
    }

    /**
    * Opens a folder. Note that the folder must already exist on your SD card. To go back to the root/home folder, use "Change to '..' folder"
    */
    //% weight=48
    //% blockId="openLog_chDirectory"
    //% block="change to %value | folder"
    //% group="filesystem"
    export function chDirectory(value: string) {
        command()
        serial.writeString("cd " + value + carriageReturn)
        serial.readUntil(commandReady)
        basic.pause(20)
        return
    }

    /**
    * Removes a folder
    */
    //% weight=45
    //% blockId="openLog_removeDir"
    //% block="remove folder %value | and it's contents"
    //% group="filesystem"
    export function removeDir(value: string) {
        command()
        serial.writeString("rm -rf " + value + carriageReturn)
        serial.readUntil(commandReady)
        basic.pause(20)
        return
    }

    /**
    * Writes a line of text to the current open file. If no file has been opened, this will be recorded to the LOGxxxx.txt folder
    */
    //% blockId="openLog_writeLine"
    //% weight=44
    //% block="write line %value | to current file"
    //% group="textfile"
    export function writeLine(value: string) {
        if (commandMode == 1) {
            serial.writeString("append " + currentFile + carriageReturn)
            serial.readUntil(writeReady)
            basic.pause(20)
        }
        serial.writeString(value + carriageReturn + newLine)
        commandMode = 0
        basic.pause(20)
        return
    }

    /**
    * Writes text to the current open file. If no file has been opened, this will be recorded to the LOGxxxx.txt folder
    */
    //% blockId="openLog_writeText"
    //% weight=43
    //% block="write %value | to current file"
    //% group="textfile"
    export function writeText(value: string) {
        if (commandMode == 1) {
            serial.writeString("append " + currentFile + carriageReturn)
            serial.readUntil(writeReady)
            basic.pause(20)
        }
        serial.writeString(value)
        commandMode = 0
        basic.pause(20)
        return
    }

    /**
    * Writes text to the current open file at the position specified. If no file has been opened, this will be recorded to the LOGxxxx.txt folder
    */
    //% weight=42
    //% blockId="openLog_writeLineOffset"
    //% block="write line %value | at position %offset"
    //% group="textfile"
    //% advanced=true
    export function writeLineOffset(value: string, offset: number) {
        command()
        serial.writeString("write " + currentFile + " " + offset.toString() + carriageReturn)
        serial.readUntil(writeReady)
        basic.pause(20)
        serial.writeString(value + carriageReturn + newLine)
        serial.readUntil(writeReady)
        basic.pause(20)
        serial.writeString(carriageReturn + newLine)
        serial.readUntil(commandReady)
        basic.pause(20)
        return
    }

    function writeRowToCSVTypeAny(values: any[], isHeader: HeaderLine) {
        let row = []

        for (let element of values) {
            if (typeof element == 'string') {
                row.push(element)
            } else {
                row.push(convertToText(element));
            }
        }

        if (commandMode == 1) {
            serial.writeString("append " + currentFile + carriageReturn)
            serial.readUntil(writeReady)
            basic.pause(20)
        }
        if (isHeader == HeaderLine.YES) {
            row.insertAt(0, "Row nr.");
            row.insertAt(1, "Date");
            row.insertAt(2, "Time");
        } else {
            let time
            let date
            date = timeanddate.date(timeanddate.DateFormat.YYYY_MM_DD)
            time = timeanddate.time(timeanddate.TimeFormat.HHMMSS24hr)
            time = time.replace(".", ":")
            row.insertAt(0, rowCounter.toString());
            row.insertAt(1, date);
            row.insertAt(2, time);
            rowCounter = rowCounter + 1;
        }
        serial.writeString(row.join(";") + carriageReturn + newLine)
        commandMode = 0
        basic.pause(20)
        return
    }

    /**
      * Opens a CSV File with the name provided (the extension .csv will be added automatically). If the file does not exist, it is created.
      */
    //% weight=49
    //% blockId="openLog_openCSVFile"
    //% block="open csv file named %value"
    //% group="csv"
    export function openCSVFile(value: string) {
        value = value + ".csv";
        openFile(value);
        return;
    }

    /**
    * Writes a row to the current open CSV file with the actual date and time. If no file has been opened, this will be recorded to the LOGxxxx.txt folder
    */
    //% blockId="openLog_writeRowWithTextToCSV"
    //% weight=48
    //% block="write one row with columns %values | to current csv file. Is Header %isHeader"
    //% isHeader.defl=HeaderLine.YES
    //% group="csv"
    export function writeRowWithTextToCSV(values: string[], isHeader: HeaderLine) {
        writeRowToCSVTypeAny(values, isHeader);
        return;
    }

    /**
    * Writes a row to the current open CSV file with the actual date and time. If no file has been opened, this will be recorded to the LOGxxxx.txt folder
    */
    //% blockId="openLog_writeRowWithNumbersToCSV"
    //% weight=47
    //% block="write one row with columns %values | to current csv file. Is Header %isHeader"
    //% isHeader.defl=HeaderLine.NO
    //% group="csv"
    export function writeRowWithNumbersToCSV(values: number[], isHeader: HeaderLine) {
        writeRowToCSVTypeAny(values, isHeader);
        return
    }
}
