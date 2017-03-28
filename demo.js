let Mobilization = require('./src/main.js');


// Инициализируем новую Мобилизацию
let mobilization2017 = new Mobilization({
  schools: [
    { name: 'ШРИ', students: 40 },
    { name: 'ШРИ', students: 45 },
    { name: 'ШМР', students: 35 },
    { name: 'ШМД', students: 30 },
    { name: 'ШМ', students: -2 },
  ],
  lectures: [
    {
      name: 'Тестирование фронтенда своими руками',
      lecturer: 'Сергей Бережной',
      dateFrom: '2017-06-03 19:00',
      duration: 90,
      place: 'Синий Кит',
      schools: ['ШРИ']
    },
    {
      name: 'Дизайн-мышление в комнатных условиях',
      lecturer: 'Покрас Лампас',
      dateFrom: '2017-06-03 19:00',
      duration: 90,
      place: 'Мулен Руж',
      schools: ['ШМД']
    },
    {
      name: 'Особенности национальной платформы',
      lecturer: 'Евгений Кастрыкин',
      dateFrom: '2017-06-03 20:30',
      duration: 90,
      place: 'Мулен Руж',
      schools: ['ШМД', 'ШМР']
    },
    {
      name: 'Крутая лекция на все школы',
      lecturer: 'Аркадий Волож',
      dateFrom: '2017-06-08 19:00',
      duration: 90,
      place: 'Синий Кит',
      schools: ['ШРИ']
    },
    {
      name: 'Lorem ipsum',
      lecturer: 'Dolor Sit',
      dateFrom: '2017-06-11 19:00',
      duration: 90,
      place: 'Мой 2007',
      schools: ['ШМД', 'ШМР']
    },
    {
      name: 'Другая лекция',
      lecturer: 'Другой препод',
      dateFrom: '2017-06-11 21:30',
      duration: 90,
      place: 'Мой 2007',
      schools: ['ШМР']
    },
    {
      name: 'Как я стал рыбой',
      lecturer: 'Евгений Комаров',
      dateFrom: '2017-06-09 19:00',
      duration: 90,
      place: 'Сентябрь Горит',
      schools: ['ШМД']
    },
    {
      name: 'А я стал игуаной',
      lecturer: 'Артемий Лебедев',
      dateFrom: '2017-06-12 20:30',
      duration: 90,
      place: 'Сентябрь Горит',
      schools: ['ШМД']
    },
    {
      name: 'Я очень крутой кодер в Яндексе',
      lecturer: 'Левый Тип-какой-то',
      dateFrom: '2017-06-12 19:00',
      duration: 90,
      place: 'Песнь Льда',
      schools: ['ШРИ', 'ШМР']
    },
    {
      name: 'Очередное мероприятие для всех',
      lecturer: 'Сергей Бережной',
      dateFrom: '2017-06-15 19:00',
      duration: 90,
      place: 'Песнь Льда',
      schools: ['ШРИ', 'ШМД', 'ШМР']
    },
  ],
  places: [
    {
      name: 'Мулен Руж',
      capacity: 90
    },
    {
      name: 'Синий Кит',
      capacity: 100
    },
    {
      name: 'Мой 2007',
      capacity: 140
    },
    {
      name: 'Песнь Льда',
      capacity: 120
    },
    {
      name: 'И Пламени',
      capacity: 130
    },
    {
      name: 'Сентябрь Горит',
      capacity: 95
    },
  ]
});


// Добавим новую лекцию и поиграемся с ней
let lecture = {
  name: 'Адаптивный дизайн и вёрстка',
  lecturer: 'Артём Федотов',
  dateFrom: '2017-06-06 19:00',
  duration: 90,
  place: 'Синий Кит',
  schools: ['ШРИ', 'ШМД']
};

// Проверим, можно ли добавить эту лекцию в наш объект Мобилизации:
console.log(mobilization2017.checkLecture(lecture));
// Попробуем её добавить
mobilization2017.addLecture(lecture);
// Выведем эту лекцию
console.log(mobilization2017.getLecture('Адаптивный дизайн и вёрстка'));
// Изменим её
mobilization2017.editLecture('Адаптивный дизайн и вёрстка', {
  name: 'Адаптивная вёрстка',
  lecturer: 'Дмитрий Душкин',
  place: 'Мулен Руж',
  schools: ['ШРИ']
});
// Выведем её с новым именем
console.log(mobilization2017.getLecture('Адаптивная вёрстка'));
// Круто! Теперь можно удалить её:
mobilization2017.deleteLecture('Адаптивная вёрстка');


// Окей, с лекциями поиграли. Можно поиграться со школами
// К примеру, вывести расписание Школы Разработки Интерфейсов с 15 апреля 2017 по 115 июня 2017
console.log(mobilization2017.schoolSchedule('ШРИ', '2017-04-15', '2017-06-15'));
// Или просто выведем всё расписание школы
console.log(mobilization2017.schoolSchedule('ШРИ'));

// Попробуем изменить эту школу:
mobilization2017.editSchool('ШРИ', {
  name: 'Школа разработки интерфейсов'
})
// и выведем её
console.log(mobilization2017.getSchool('Школа разработки интерфейсов'));

// Добавим новую школу:
let school = {
  name: 'Академия Гипербатона',
  students: 666
}

mobilization2017.addSchool(school);
// Выведем её
console.log(mobilization2017.getSchool('Академия Гипербатона'));
// Какая-то она уж очень богатая на студентов. Надо это изменить.
mobilization2017.editSchool('Академия Гипербатона', {
  students: 25
})
// Снова выведем её
console.log(mobilization2017.getSchool('Академия Гипербатона'));
// Теперь вроде всё в порядке. Можно её удалять:
mobilization2017.deleteSchool('Академия Гипербатона');

// Теперь можно и с аудиториями поиграть
// Давайте найдём аудиторию:
let siniyKit = mobilization2017.getPlace('Синий Кит');
console.log(siniyKit);
// И посмотрим всё её расписание
console.log(mobilization2017.placeSchedule(siniyKit));
// Проверим, можно ли в неё вместить студентов школ "ШМД" и "ШМР" одновременно
console.log(mobilization2017.placeIsCapable(siniyKit, ['ШМД', 'ШМР'])); // true
// А влезут ли в неё студенты всех школ сразу?
console.log(mobilization2017.placeIsCapable(siniyKit, mobilization2017.schools)); // false
// Отредактируем её так, чтобы всем хватило места:
mobilization2017.editPlace(siniyKit.name, {
  capacity: 220 // теперь точно всех вместит
});
// Обновим переменную отредактированной аудиторией
siniyKit = mobilization2017.getPlace('Синий Кит');
// и выведем её
console.log(siniyKit);

// А теперь добавим новую:
let place = {
  name: 'Кашель из Космоса',
  capacity: 320
}
mobilization2017.addPlace(place);
// Найдём её и выведем:
let kashel = mobilization2017.getPlace('Кашель из Космоса');
// Проверим, свободна ли она 26 июня 2017 в 19:00
console.log(mobilization2017.placeIsFree(kashel, '2017-06-26 19:00')); // true
console.log(kashel);
// А теперь можно и удалить её:
mobilization2017.deletePlace(kashel.name);
