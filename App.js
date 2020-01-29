/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  ToastAndroid,
  ScrollView
} from 'react-native';

import QRCodeScanner from 'react-native-qrcode-scanner';
import BluetoothSerial from 'react-native-bluetooth-serial'


class ScanScreen extends Component {

  constructor(props) {
    super(props);

    this.state = {
      clickOnScan: true,
      clickOnBluetooth: false,
      responseData: false,
      openQRScanner: false,
      BluetoothDevices: false,
      response: [],
      bluetoothDevicespaired: [],
      bluetoothDevicesunpaired: [],
      scanningPaired: false,
      scanningUnpaired: false,

      index: -1

    }
  }




  onSuccess = (e) => {


    fetch('https://vendekin.in/vendekin_aws/react_php_api_calls/json_data/product_list.php?qrcode=' + e.rawData)
      .then((response) => response.json())
      .then((responseJson) => {
        let data = [];

        Object.values(responseJson).forEach((item) => {
          data.push(item)
        })

        this.setState({ openQRScanner: false, responseData: true, response: data })

      })
      .catch((error) => {
        console.error(error);
      });
  }

  BluetoothDevicesOn = () => {
    this.setState({ clickOnScan: false, BluetoothDevices: true, scanningPaired: true ,scanningUnpaired: true})
    BluetoothSerial.discoverUnpairedDevices()
      .then((list) => {
        this.setState({ bluetoothDevicesunpaired: [...list] }, () => {
          this.setState({ scanningUnpaired: false })
        })
      })

    BluetoothSerial.list()
      .then((list) => {
        this.setState({ bluetoothDevicespaired: [...list] }, () => {
          this.setState({ scanningPaired: false })
        })
      })


  }

  connectBlutoothDevice = (address, index) => {

    BluetoothSerial.connect(address).then((Success) => {
      this.setState({ index: index })
      ToastAndroid.show(Success.message, ToastAndroid.SHORT);
    })

  }

  disconnectBlutoothDevice = () => {

    BluetoothSerial.disconnect().then(() => {
      this.setState({ index: -1 })
      ToastAndroid.show("Disconnected", ToastAndroid.SHORT);
    })

  }



  render() {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView>
          {
            this.state.clickOnScan ?
              <View>
                <TouchableOpacity
                  onPress={() => {
                    this.setState({ clickOnScan: false, openQRScanner: true })
                  }}
                >
                  <View style={styles.buttonStyle}>
                    <Text style={styles.text}>SCAN QRCODE</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={this.BluetoothDevicesOn}
                >
                  <View style={styles.buttonStyle}>
                    <Text style={styles.text}>Search  Near By Machines</Text>
                  </View>
                </TouchableOpacity>
              </View>
              :
              null
          }
          {

            this.state.openQRScanner ?
              < QRCodeScanner
                onRead={this.onSuccess}
                topContent={
                  <Text style={styles.centerText}> QR Scanner </Text>
                }
                bottomContent={
                  <TouchableOpacity style={styles.buttonTouchable}>
                    <Text style={styles.buttonText}>OK. Got it!</Text>
                  </TouchableOpacity>
                }
              />
              :
              null
          }
          {
            this.state.responseData ?
              <View >
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => {
                    this.setState({ clickOnScan: true, responseData: false })
                  }}
                >
                  <Text style={{ color: "white" }}>Back</Text>
                </TouchableOpacity>
                <FlatList
                  data={this.state.response}
                  numColumns={2}
                  renderItem={({ item }) => {
                    return (
                      <View style={styles.FlatListContainer}>
                        <Image
                          style={{ width: 150, height: 150 }}
                          source={{ uri: 'https://www.bigbasket.com/media/uploads/p/xxl/100022654_4-lays-potato-chips-joyful-magic-masala.jpg' }}
                        />
                        <Text>{item.product_name}</Text>
                        <Text>Qty : {item.qty}</Text>
                        <Text>Price : {item.price}</Text>
                      </View>
                    )
                  }}
                  keyExtractor={item => item.product_name}
                />
              </View>

              :
              null
          }

          {

            this.state.BluetoothDevices ?
              // <BlueToothManager />
              <ScrollView >

                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => {
                    this.setState({ clickOnScan: true, BluetoothDevices: false })
                  }}
                >
                  <Text style={{ color: "white" }}>Back</Text>
                </TouchableOpacity>
                
                <Text>
                  Paired Devices
                </Text>
                {
                  this.state.scanningPaired ? <ActivityIndicator size="small" color="#00ff00" /> : null
                }


                <FlatList
                  data={this.state.bluetoothDevicespaired}
                  numColumns={1}
                  renderItem={({ item, index }) => {
                    return (
                      <View style={[styles.FlatListContainer, { width: "100%", }]}>
                        <Text>Machine Name : {item.name}</Text>
                        <Text>MAC Address : {item.address}</Text>
                        {
                          this.state.index === index ?
                            <TouchableOpacity
                              style={styles.backButton}
                              onPress={() => this.disconnectBlutoothDevice()}
                            >
                              <Text style={{ color: "white" }}>DISCONNECT</Text>
                            </TouchableOpacity>
                            :
                            <TouchableOpacity
                              style={styles.backButton}
                              onPress={() => this.connectBlutoothDevice(item.address, index)}
                            >
                              <Text style={{ color: "white" }}>CONNECT</Text>
                            </TouchableOpacity>
                        }

                      </View>
                    )
                  }}
                />

                <Text>
                  Unpaired Devices
                </Text>
                {
                  this.state.scanningUnpaired ? <ActivityIndicator size="small" color="#00ff00" /> : null
                }

                <FlatList
                  data={this.state.bluetoothDevicesunpaired}
                  numColumns={1}
                  renderItem={({ item, index }) => {
                    return (
                      <View style={[styles.FlatListContainer, { width: "100%", }]}>
                        <Text>Machine Name : {item.name}</Text>
                        <Text>MAC Address : {item.address}</Text>
                        {
                          this.state.index === index ?
                            <TouchableOpacity
                              style={styles.backButton}
                              onPress={() => this.disconnectBlutoothDevice()}
                            >
                              <Text style={{ color: "white" }}>DISCONNECT</Text>
                            </TouchableOpacity>
                            :
                            <TouchableOpacity
                              style={styles.backButton}
                              onPress={() => this.connectBlutoothDevice(item.address, index)}
                            >
                              <Text style={{ color: "white" }}>CONNECT</Text>
                            </TouchableOpacity>
                        }

                      </View>
                    )
                  }}
                />
              </ScrollView>
              :
              null
          }
        </SafeAreaView>
      </View>
    );
  }



};

const styles = StyleSheet.create({
  buttonStyle: {
    backgroundColor: "blue",
    width: 200,
    borderRadius: 50,
    margin: 10
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: "center"
  },
  text: {
    padding: 15,
    color: 'white',
    textAlign: "center"
  },
  FlatListContainer: {
    width: "50%",
    borderWidth: 2,
    borderColor: "black",
    padding: 20
  },
  backButton: {
    backgroundColor: "blue",
    padding: 14,
    justifyContent: "flex-start",
    margin: 10,
    borderRadius: 50,
    width: 150,
    alignItems: "center"
  }
});

export default ScanScreen;
