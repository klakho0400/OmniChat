document.addEventListener("DOMContentLoaded", function () {
    const chatMessages = document.getElementById("chat-messages");
    const messageInput = document.getElementById("message-input");
    const sendButton = document.getElementById("send-button");

    const serverAddress = "127.0.0.1";
    const serverPort = prompt("Enter the server port (e.g., 3000)");
    const language = prompt("Enter your choice of language");


    var langs = {
        'auto': 'Automatic',
        'af': 'Afrikaans',
        'sq': 'Albanian',
        'am': 'Amharic',
        'ar': 'Arabic',
        'hy': 'Armenian',
        'az': 'Azerbaijani',
        'eu': 'Basque',
        'be': 'Belarusian',
        'bn': 'Bengali',
        'bs': 'Bosnian',
        'bg': 'Bulgarian',
        'ca': 'Catalan',
        'ceb': 'Cebuano',
        'ny': 'Chichewa',
        'zh': 'Chinese (Simplified)',
        'zh-cn': 'Chinese (Simplified)',
        'zh-tw': 'Chinese (Traditional)',
        'co': 'Corsican',
        'hr': 'Croatian',
        'cs': 'Czech',
        'da': 'Danish',
        'nl': 'Dutch',
        'en': 'English',
        'eo': 'Esperanto',
        'et': 'Estonian',
        'tl': 'Filipino',
        'fi': 'Finnish',
        'fr': 'French',
        'fy': 'Frisian',
        'gl': 'Galician',
        'ka': 'Georgian',
        'de': 'German',
        'el': 'Greek',
        'gu': 'Gujarati',
        'ht': 'Haitian Creole',
        'ha': 'Hausa',
        'haw': 'Hawaiian',
        'he': 'Hebrew',
        'iw': 'Hebrew',
        'hi': 'Hindi',
        'hmn': 'Hmong',
        'hu': 'Hungarian',
        'is': 'Icelandic',
        'ig': 'Igbo',
        'id': 'Indonesian',
        'ga': 'Irish',
        'it': 'Italian',
        'ja': 'Japanese',
        'jw': 'Javanese',
        'kn': 'Kannada',
        'kk': 'Kazakh',
        'km': 'Khmer',
        'ko': 'Korean',
        'ku': 'Kurdish (Kurmanji)',
        'ky': 'Kyrgyz',
        'lo': 'Lao',
        'la': 'Latin',
        'lv': 'Latvian',
        'lt': 'Lithuanian',
        'lb': 'Luxembourgish',
        'mk': 'Macedonian',
        'mg': 'Malagasy',
        'ms': 'Malay',
        'ml': 'Malayalam',
        'mt': 'Maltese',
        'mi': 'Maori',
        'mr': 'Marathi',
        'mn': 'Mongolian',
        'my': 'Myanmar (Burmese)',
        'ne': 'Nepali',
        'no': 'Norwegian',
        'ps': 'Pashto',
        'fa': 'Persian',
        'pl': 'Polish',
        'pt': 'Portuguese',
        'pa': 'Punjabi',
        'ro': 'Romanian',
        'ru': 'Russian',
        'sm': 'Samoan',
        'gd': 'Scots Gaelic',
        'sr': 'Serbian',
        'st': 'Sesotho',
        'sn': 'Shona',
        'sd': 'Sindhi',
        'si': 'Sinhala',
        'sk': 'Slovak',
        'sl': 'Slovenian',
        'so': 'Somali',
        'es': 'Spanish',
        'su': 'Sundanese',
        'sw': 'Swahili',
        'sv': 'Swedish',
        'tg': 'Tajik',
        'ta': 'Tamil',
        'te': 'Telugu',
        'th': 'Thai',
        'tr': 'Turkish',
        'uk': 'Ukrainian',
        'ur': 'Urdu',
        'uz': 'Uzbek',
        'vi': 'Vietnamese',
        'cy': 'Welsh',
        'xh': 'Xhosa',
        'yi': 'Yiddish',
        'yo': 'Yoruba',
        'zu': 'Zulu'
    };

    function getCode(desiredLang) {
        if (!desiredLang) {
            return false;
        }
        desiredLang = desiredLang.toLowerCase();
    
        if (langs[desiredLang]) {
            return desiredLang;
        }
    
        var keys = Object.keys(langs).filter(function (key) {
            if (typeof langs[key] !== 'string') {
                return false;
            }
    
            return langs[key].toLowerCase() === desiredLang;
        });
    
        return keys[0] || false;
    }

 
    

    const socket = new WebSocket(`ws://${serverAddress}:${serverPort}`);

  // Assuming you have already obtained the desired language choice

  socket.addEventListener("open", function () {
    const language_choice = getCode(language);
    if (language_choice) {
        socket.send(`language_choice:${language_choice}`);
    }
});



    socket.addEventListener("message", function (event) {
        const message = event.data;
        const parts = message.split(':');

        if (parts.length >= 2) {
            sender = parts[0]; 
            messageContent = parts[1];
        }
        appendMessage(sender, messageContent);
    });

    socket.addEventListener("error", function (event) {
        console.error("WebSocket error:", event);
    });

    sendButton.addEventListener("click", function () {
        const message = messageInput.value.trim();
        if (message !== "") {
            socket.send(message);
            appendMessage("You", message);
            messageInput.value = "";
        }
    });

    function appendMessage(sender, message) {
        const messageDiv = document.createElement("div");
        messageDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
        chatMessages.appendChild(messageDiv);

        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});