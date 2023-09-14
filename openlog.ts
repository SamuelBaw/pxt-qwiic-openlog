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
    JA = 1,
    NEIN = 0,
}

const ADDR = 0x2A
//Bits found in the getStatus() byte
const STATUS_SD_INIT_GOOD = 0
const STATUS_LAST_COMMAND_SUCCESS = 1
const STATUS_LAST_COMMAND_KNOWN = 2
const STATUS_FILE_OPEN = 3
const STATUS_IN_ROOT_DIRECTORY = 4

const STRING_MAX_SEND_LENGTH = 31 //32 minus ADDR

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

    let currentFile = ""
    let rowCounter = 0

    // internal function for sending a command without answer
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

    // internal function for sending a command with answer
    function sendGetCommand(registerNumber: number, optionalString: string): number {

        if (optionalString.length > 0) {
            let stringBuf: Buffer = pins.createBuffer(optionalString.length);
            let sendBuf: Buffer = pins.createBuffer(optionalString.length + 1);
            stringBuf = Buffer.fromUTF8(optionalString);
            sendBuf[0] = registerNumber; // first byte must be register number
            sendBuf.write(1, stringBuf); // second and other byte are string message
            pins.i2cWriteBuffer(ADDR, sendBuf, false);

        }
        else {
            let sendBuf: Buffer = pins.createBuffer(1);
            sendBuf[0] = registerNumber;
            pins.i2cWriteBuffer(ADDR, sendBuf, false);
        }
        return pins.i2cReadNumber(ADDR, NumberFormat.UInt8LE,false);

    }

    //internal function for synchronizing the opened file with the sent message
    //an opened file must be synced (or closed) to actually save the sent data 
    function syncFile() {
        sendCommand(RegisterMap.syncFile, "");
        basic.pause(20)
        return
    }

    /**
    * Initializes openlog and waits until it says it is ready to be written to.
    */
    //% weight=68 
    //% blockId="openLog_begin" 
    //% block="initialisiere Logger"
    //% group="init"
    export function begin():boolean {
        basic.pause(500)
        sendGetCommand(RegisterMap.status, ""); // to flush out last state
        basic.pause(100)
        sendGetCommand(RegisterMap.logInit, "");
        basic.pause(100)

        let status = sendGetCommand(RegisterMap.status,"");

        if (status & 1 << STATUS_SD_INIT_GOOD) {
            // We are good to go!
            return true;
        }
        return false;// SD did not init. Card not present?
    }


    /**
    * Initializes date and time
    */
    //% weight=59 
    //% blockId="openLog_set_Date" 
    //% block="stelle Datum und Zeit auf Jahr %year, Monat %month, Tag %day, Stunde %hour, Minute %minute"
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
    //% block="öffne Datei mit Namen %value"
    //% group="textfile"
    export function openFile(value: string) {
        sendCommand(RegisterMap.openFile, value);
        currentFile = value;
        basic.pause(20)
        return
    }

    /**
    * Removes the file with the provided name
    */
    //% weight=47
    //% blockId="openLog_removeFile"
    //% block="entferne Datei %value"
    //% group="filesystem"
    export function removeFile(value: string) {
        sendCommand(RegisterMap.rm, value);
        basic.pause(20)
        return
    }

    /**
    * Creates a folder. Note that this block does not open the folder that it creates
    */
    //% weight=49
    //% blockId="openLog_mkDirectory"
    //% block="erstelle Ordner mit Namen%value"
    //% group="filesystem"
    export function mkDirectory(value: string) {
        sendCommand(RegisterMap.mkDir, value);
        basic.pause(20)
        return
    }

    /**
    * Creates a file. Note that this block does not open the file that it creates
    */
    //% weight=49
    //% blockId="openLog_createFile"
    //% block="erstelle Datei mit Namen %value"
    //% group="filesystem"
    /*export function createFile(value: string) {
        sendCommand(RegisterMap.createFile, value);
        basic.pause(20)
        return
    }*/ //BASA not needed when you have open file

    /**
    * Opens a folder. Note that the folder must already exist on your SD card. To go back to the root/home folder, use "Change to '..' folder"
    */
    //% weight=48
    //% blockId="openLog_chDirectory"
    //% block="wechsle zu %value | Ordner"
    //% group="filesystem"
    export function chDirectory(value: string) {

        serial.writeLine(String.fromCharCode(26));
        sendCommand(RegisterMap.cd, value);
        basic.pause(20)
        return
    }

    /**
    * Removes a folder
    */
    //% weight=45
    //% blockId="openLog_removeDir"
    //% block="entferne Ordner %value | und dessen Inhalt"
    //% group="filesystem"
    export function removeDir(value: string) {
        sendCommand(RegisterMap.rmrf, value);
        basic.pause(20)
        return
    }

    /**
    * Writes a line of text to the current open file.
    */
    //% blockId="openLog_writeLine"
    //% weight=44
    //% block="schreibe Zeile %value | in geöffnete Datei"
    //% group="textfile"
    export function writeLine(lineToWrite: string) {

        writeText(lineToWrite);  // linebreak
        writeText("\n");  // linebreak
        return
    }

    /**
    * Writes text to the current open file.
    */
    //% blockId="openLog_writeText"
    //% weight=43
    //% block="schreibe Text %value | in geöffnete Datei"
    //% group="textfile"
    export function writeText(textToWrite: string) {
        // remember, the rx buffer on the i2c openlog is 32 bytes
        // and the register address takes up 1 byte so we can only
        // send 31 data bytes at a time. This function splits the input
        // string to multiple strings if the size exceeds the STRING_MAX_SEND_LENGTH.

        if (textToWrite.length > 0) {
            let numOfMaxLengthStrings = Math.floor(textToWrite.length / STRING_MAX_SEND_LENGTH);
            let rest = textToWrite.length % STRING_MAX_SEND_LENGTH;

            for (let i = 0; i <= textToWrite.length; i = i + STRING_MAX_SEND_LENGTH) {

                if (i + STRING_MAX_SEND_LENGTH <= textToWrite.length)
                {
                    writeText_maxLengthGuaranteed(textToWrite.substr(i, STRING_MAX_SEND_LENGTH)); // send 31 byte package
                }
            }
            writeText_maxLengthGuaranteed(textToWrite.substr(numOfMaxLengthStrings * STRING_MAX_SEND_LENGTH,  rest)); // send rest
        }
        syncFile(); // text is actually written to the file, no closing necessary
        basic.pause(20)
        return
    }

    // function that is called by writeText() after length check. do not call directly
    function writeText_maxLengthGuaranteed(textToWrite: string) {

        let stringBuf: Buffer = pins.createBuffer(textToWrite.length);
        let sendBuf: Buffer = pins.createBuffer(textToWrite.length + 1);
        stringBuf = Buffer.fromUTF8(textToWrite);
        sendBuf[0] = RegisterMap.writeFile;     // first byte must be register number
        sendBuf.write(1, stringBuf);            // second and other byte are string message

        pins.i2cWriteBuffer(ADDR, sendBuf, false);
        basic.pause(20)

    }

    // write a row to the csv file
    function writeRowToCSVTypeAny(values: any[], isHeader: HeaderLine) {
        let row = []

        for (let element of values) {
            if (typeof element == 'string') {
                row.push(element)
            } else {
                row.push(convertToText(element));
            }
        }

        if (isHeader == HeaderLine.JA) {
            row.insertAt(0, "Zeile Nr.");
            row.insertAt(1, "Datum");
            row.insertAt(2, "Zeit");
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

        for (let cell = 0; cell < row.length; cell++) {
            writeText(row[cell]);
            writeText(";");
        }
        writeText("\n");  // linebreak

        basic.pause(20)
        return
    }

    /**
    * Opens a CSV File with the name provided (the extension .csv will be added automatically). If the file does not exist, it is created.
    */
    //% weight=49
    //% blockId="openLog_openCSVFile"
    //% block="öffne csv-Datei mit Namen %value"
    //% group="csv"
    export function openCSVFile(value: string) {
        value = value + ".csv";
        openFile(value);
        return;
    }

    /**
    * Writes a row to the current open CSV file with the actual date and time.
    */
    //% blockId="openLog_writeRowWithTextToCSV"
    //% weight=48
    //% block="Schreibe eine Zeile mit Text %values | in geöffnete csv Datei. Ist erste Zeile %isHeader"
    //% isHeader.defl=HeaderLine.YES
    //% group="csv"
    export function writeRowWithTextToCSV(values: string[], isHeader: HeaderLine) {
        writeRowToCSVTypeAny(values, isHeader);
        return;
    }

    /**
    * Writes a row to the current open CSV file with the actual date and time.
    */
    //% blockId="openLog_writeRowWithNumbersToCSV"
    //% weight=47
    //% block="Schreibe eine Zeile mit Nummern %values | in geöffnete csv Datei. Ist erste Zeile %isHeader"
    //% isHeader.defl=HeaderLine.NO
    //% group="csv"
    export function writeRowWithNumbersToCSV(values: number[], isHeader: HeaderLine) {
        writeRowToCSVTypeAny(values, isHeader);
        return
    }

    /**
    * Writes text to the current open file at the position specified.
    */
    //% weight=42
    //% blockId="openLog_writeLineOffset"
    //% block="write line %value | at position %offset"
    //% group="textfile"
    //% advanced=true
    /*export function writeLineOffset(lineToWrite: string, offset: number) {
        // remember, the rx buffer on the i2c openlog is 32 bytes
        // and the register address takes up 1 byte so we can only
        // send 31 data bytes at a time
        if (lineToWrite.length > 31) {
            return;
            //return -1;
        }
        if (lineToWrite.length > 0) {

            let offsetBuf: Buffer = pins.createBuffer(2);
            offsetBuf[0] = RegisterMap.startPosition;
            offsetBuf[1] = offset;
            pins.i2cWriteBuffer(ADDR, offsetBuf, false);
            basic.pause(20)

            //sendCommand(RegisterMap.startPosition, offset.toString() )

            //let stringBuf: Buffer = pins.createBuffer(lineToWrite.length);
            //let sendBuf: Buffer = pins.createBuffer(lineToWrite.length + 3);
            //stringBuf = Buffer.fromUTF8(lineToWrite);
            //sendBuf[0] = RegisterMap.writeFile;     // first byte must be register number
            //sendBuf.write(1, stringBuf);            // second and other byte are string message
            //sendBuf[(lineToWrite.length + 1)] = 10; //linebreak

            //pins.i2cWriteBuffer(ADDR, sendBuf, false);
        }
        basic.pause(20)
        return
    }*/ // BASA: This functionality is not included in this logger, this method does not work
}