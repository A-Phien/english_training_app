-- Tạo bảng topic
INSERT INTO topic (name, description, icon) VALUES
('Động Vật', 'Từ vựng về các loài động vật trong tự nhiên', '🐾'),
('Trái Cây & Thực Phẩm', 'Các loại trái cây, thức ăn hàng ngày', '🍎'),
('Giao Tiếp Cơ Bản', 'Câu giao tiếp thông dụng mỗi ngày', '💬'),
('Công Việc & Nghề Nghiệp', 'Từ vựng về các ngành nghề', '💼'),
('Du Lịch', 'Từ vựng hữu ích khi đi du lịch', '✈️');

-- Từ vựng chủ đề Động Vật (id=1)
INSERT INTO vocabulary (word, ipa, translation, example, example_translation, topic_id) VALUES
('dog',      '/dɒɡ/',     'con chó',    'The dog is barking.',          'Con chó đang sủa.',             1),
('cat',      '/kæt/',     'con mèo',    'My cat sleeps all day.',       'Con mèo của tôi ngủ cả ngày.',  1),
('elephant', '/ˈel.ɪ.fənt/', 'con voi', 'Elephants have good memory.', 'Voi có trí nhớ tốt.',           1),
('bird',     '/bɜːrd/',   'con chim',   'The bird is singing.',         'Con chim đang hót.',             1),
('fish',     '/fɪʃ/',     'con cá',     'Fish live in water.',          'Cá sống dưới nước.',             1),
('lion',     '/ˈlaɪ.ən/', 'con sư tử', 'The lion is the king.',        'Sư tử là vua của rừng xanh.',   1),
('rabbit',   '/ˈræb.ɪt/','con thỏ',    'Rabbits like carrots.',        'Thỏ thích cà rốt.',              1),
('horse',    '/hɔːrs/',   'con ngựa',   'She rides her horse every day.','Cô ấy cưỡi ngựa mỗi ngày.',  1);

-- Từ vựng chủ đề Trái Cây (id=2)
INSERT INTO vocabulary (word, ipa, translation, example, example_translation, topic_id) VALUES
('apple',      '/ˈæp.əl/',   'quả táo',       'An apple a day keeps the doctor away.', 'Một quả táo mỗi ngày giúp xa bác sĩ.', 2),
('banana',     '/bəˈnɑː.nə/','quả chuối',     'I eat a banana for breakfast.',         'Tôi ăn chuối cho bữa sáng.',           2),
('orange',     '/ˈɒr.ɪndʒ/', 'quả cam',       'Orange juice is healthy.',              'Nước cam rất tốt cho sức khỏe.',        2),
('mango',      '/ˈmæŋ.ɡoʊ/','quả xoài',      'Mangoes are sweet and juicy.',          'Xoài ngọt và nhiều nước.',              2),
('strawberry', '/ˈstrɔː.ber.i/','quả dâu tây','I love strawberry ice cream.',          'Tôi thích kem dâu tây.',                2),
('grape',      '/ɡreɪp/',    'quả nho',        'Grapes can be made into wine.',         'Nho có thể làm rượu vang.',             2),
('watermelon', '/ˈwɔː.tər.mel.ən/','quả dưa hấu','Watermelon is great in summer.',   'Dưa hấu rất ngon vào mùa hè.',         2);

-- Từ vựng chủ đề Giao Tiếp Cơ Bản (id=3)
INSERT INTO vocabulary (word, ipa, translation, example, example_translation, topic_id) VALUES
('hello',     '/həˈloʊ/',  'xin chào',       'Hello! How are you?',           'Xin chào! Bạn có khỏe không?',    3),
('thank you', '/θæŋk juː/','cảm ơn',         'Thank you for your help.',      'Cảm ơn bạn đã giúp đỡ.',          3),
('sorry',     '/ˈsɒr.i/',  'xin lỗi',        'I am sorry for being late.',    'Tôi xin lỗi vì đến muộn.',        3),
('please',    '/pliːz/',   'làm ơn',          'Please help me.',               'Làm ơn giúp tôi.',                 3),
('goodbye',   '/ˌɡʊdˈbaɪ/','tạm biệt',      'Goodbye! See you tomorrow.',    'Tạm biệt! Hẹn gặp lại ngày mai.', 3),
('excuse me', '/ɪkˈskjuːz mi/','xin phép',   'Excuse me, where is the bank?', 'Xin phép, ngân hàng ở đâu?',      3);
