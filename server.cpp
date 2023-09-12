#include <iostream>
#include <WinSock2.h>
#include <WS2tcpip.h>
#include <thread>
#include <map>
#include <vector>
#include <string>

#pragma comment(lib, "ws2_32.lib")

using namespace std;

const int MAX_CLIENTS = 10;
const int PORT = 8083;
int clientCount = 0;

map<int,SOCKET> client_info;
vector<int> taken(11,0);

// Function to handle a client connection
void HandleClient(SOCKET clientSocket) {
    
    for(int i = 1; i <= MAX_CLIENTS; i++)
    {
        if(taken[i]==0)
        {client_info[i] = clientSocket;
        cout << "Client No." << i <<  " connected." << endl;
            taken[i] = 1;
            break;
        }
    }
    char buffer[10000];
    while (true) {
        int bytesReceived = recv(clientSocket, buffer, sizeof(buffer), 0);
        if (bytesReceived <= 0) {
            // Handle client disconnect
            for(auto &it : client_info) { 
                if(it.second == clientSocket) { 
                cout << "Client No." << it.first << " disconnected" << endl;
                taken[it.first] = 0;
                break;
                }
            }
           
            clientCount--;
        
            closesocket(clientSocket);
            return;
        }
        
        int client_no;
         for(auto &it : client_info) { 
                if(it.second == clientSocket) { 
                    client_no = it.first;
                    break;
                }
         }
        buffer[bytesReceived] = '\0';
        cout << "Received from Client No." <<  client_no << " "<< buffer << endl;
        buffer[bytesReceived] = '~';
        buffer[bytesReceived+1] = client_no+'0';
        // Broadcast the message to all connected clients
        for (int i = 0; i < MAX_CLIENTS; i++) {
            if (client_info[i] != clientSocket) {
                send(client_info[i], buffer, bytesReceived+2, 0);
            }
        }
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
    SOCKET serverSocket = socket(AF_INET, SOCK_STREAM, 0);
    if (serverSocket == INVALID_SOCKET) {
        cerr << "Failed to create socket." << endl;
        return 1;
    }

    // Bind the socket
    sockaddr_in serverAddr;
    serverAddr.sin_family = AF_INET;
    serverAddr.sin_port = htons(PORT);
    serverAddr.sin_addr.s_addr = INADDR_ANY;

    if (bind(serverSocket, (sockaddr*)&serverAddr, sizeof(serverAddr)) == SOCKET_ERROR) {
        cerr << "Failed to bind socket." << endl;
        return 1;
    }

    // Listen for incoming connections
    if (listen(serverSocket, SOMAXCONN) == SOCKET_ERROR) {
        cerr << "Failed to listen on socket." << endl;
        return 1;
    }

    cout << "Server listening on port " << PORT << endl;

    vector<thread> clientThreads;
    SOCKET clientSockets[MAX_CLIENTS] = { 0 };

    while (true) {
        SOCKET clientSocket = accept(serverSocket, nullptr, nullptr);
        if (clientSocket == INVALID_SOCKET) {
            cerr << "Failed to accept client connection." << endl;
            continue;
        }

        if (clientCount < MAX_CLIENTS) {
            clientSockets[clientCount++] = clientSocket;
            clientThreads.push_back(thread(HandleClient, clientSocket));
            
        } else {
            cerr << "Max clients reached. Connection rejected." << endl;
            closesocket(clientSocket);
        }
    }

    // Clean up
    closesocket(serverSocket);
    WSACleanup();

    return 0;
}
