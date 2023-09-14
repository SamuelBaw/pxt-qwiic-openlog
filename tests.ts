basic.showIcon(IconNames.Sad)
basic.pause(100)
basic.showIcon(IconNames.Happy)
basic.pause(100)
if (openLog.begin()) {
    basic.showIcon(IconNames.Yes)
} else {
    basic.showIcon(IconNames.No)
}
openLog.mkDirectory("home")
openLog.chDirectory("home")
openLog.openFile("ueberlaufTest.txt")
openLog.writeText("anfang")
openLog.writeLine("ende")
openLog.writeLine("123456789ABCDEFGHIJKLMNOPQRS")
openLog.writeLine("123456789ABCDEFGHIJKLMNOPQRST")
openLog.writeLine("123456789ABCDEFGHIJKLMNOPQRSTU")
openLog.writeLine("123456789ABCDEFGHIJKLMNOPQRSTUV")
openLog.writeLine("123456789ABCDEFGHIJKLMNOPQRSTUVW")
openLog.writeLine("123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ")
openLog.writeLine("123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ")
openLog.writeLine("123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ")
openLog.writeLine("Ende")
basic.showIcon(IconNames.Rollerskate)
openLog.setDateAndTime(
    2023,
    9,
    13,
    13,
    13
)
openLog.openCSVFile("ueberlaufTestCSV")
openLog.writeRowWithTextToCSV(["x", "123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", "y"], HeaderLine.JA)
openLog.writeRowWithNumbersToCSV([7, 1.1111111111111111e+144, 7], HeaderLine.NEIN)
basic.showIcon(IconNames.StickFigure)
