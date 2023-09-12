#include <iostream>
#include <WinSock2.h>
#include <WS2tcpip.h>
#include <thread>
#include <string>

#pragma comment(lib, "ws2_32.lib")

using namespace std;

const int PORT = 8083;

void ReceiveMessages(SOCKET clientSocket) {
    char buffer[10000];
    // cout << "hello";
    // cout << clientSocket;
    while (true) {
        int bytesReceived = recv(clientSocket, buffer, sizeof(buffer), 0);
        if (bytesReceived <= 0) {
            cerr << "Server disconnected." << endl;
            break;
        }
        buffer[bytesReceived] = '\0';
         char* tildePos = strchr(buffer, '~');
            *tildePos = '\0'; // Replace the tilde '~' with null terminator
            const char* sender = tildePos + 1; // Extract sender (the character after '~')
            const char* messageContent = buffer; // Message content is before '~'

            std::cout << "Received from " << sender << ": " << messageContent << std::endl;
    }
}

int main() {
    // Initialize Winsock
    WSADATA wsData;
    if (WSAStartup(MAKEWORD(2, 2), &wsData) != 0) {
        cerr << "Failed to initialize Winsock." << endl;
        return 1;
    }

    // Create a socket
    SOCKET clientSocket = socket(AF_INET, SOCK_STREAM, 0);
    if (clientSocket == INVALID_SOCKET) {
        cerr << "Failed to create socket." << endl;
        return 1;
    }

    // Connect to the server
    sockaddr_in serverAddr;
    serverAddr.sin_family = AF_INET;
    serverAddr.sin_port = htons(PORT);
    
    // Use a narrow-character string for the IP address
    if (inet_pton(AF_INET, "127.0.0.1", &(serverAddr.sin_addr)) != 1) {
        cerr << "Failed to convert IP address." << endl;
        closesocket(clientSocket);
        WSACleanup();
        return 1;
    }

    if (connect(clientSocket, (sockaddr*)&serverAddr, sizeof(serverAddr)) == SOCKET_ERROR) {
        cerr << "Failed to connect to the server." << endl;
        closesocket(clientSocket);
        WSACleanup();
        return 1;
    }

    // Start a thread to receive messages
    thread receiveThread(ReceiveMessages, clientSocket);

    // Main loop to send messages
    string message;
    while (true) {
        getline(cin, message);
        if (send(clientSocket, message.c_str(), message.size(), 0) == SOCKET_ERROR) {
            cerr << "Failed to send message." << endl;
            break;
        }
    }

    // Clean up
    closesocket(clientSocket);
    WSACleanup();

    return 0;
}
