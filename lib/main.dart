import 'package:flutter/material.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        appBar: AppBar(
          title: Text('Chatter'),
        ),
        body: Center(
          child: Text(
            'Welcome Back!',
            style: TextStyle(fontSize: 24),
          ),
        ),
      ),
    );
  }
}