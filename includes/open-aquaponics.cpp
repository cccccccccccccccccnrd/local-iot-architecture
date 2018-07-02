#include <Arduino.h>
#include <OpenAquarium.h>

#define point_1_cond 1413
#define point_1_cal 602.27
#define point_2_cond 12880
#define point_2_cal 100

float temperature;
float resistanceEC;
float EC;

void setup() {
  Serial.begin(115200);
  OpenAquarium.init();
  OpenAquarium.calibrateEC(point_1_cond,point_1_cal,point_2_cond,point_2_cal);
  delay(500);
}

void loop() {
  temperature = OpenAquarium.readtemperature();

  EC = OpenAquarium.ECConversion(resistanceEC);
  resistanceEC = OpenAquarium.readResistanceEC();

  Serial.print("{\"temperature\":");
  Serial.print(temperature);
  Serial.print(",");
  Serial.print("\"ec\":");
  Serial.print(EC);
  Serial.println("}");

  delay(2000);
}