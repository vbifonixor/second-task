'use strict'

const moment = require('moment');
require('moment/locale/ru');

moment.locale('ru');

// console.log(moment('2016-06-03 19:00').format('Do MMM YYYY hh:mm'));

class Mobilization {

  constructor(setup) {

    // Инициализируем основные массивы для сущностей
    this.schools = [];
    this.lectures = [];
    this.places = [];

    if(setup) {
      if (setup.schools) { // Проверяем школы
        setup.schools.forEach((school) => {
          this.addSchool(school);
        })
      }
      if (setup.places) {
        setup.places.forEach((place) => {
          this.addPlace(place);
        });
      }
      if (setup.lectures) {
        setup.lectures.forEach((lecture) => {
          this.addLecture(lecture);
        });
      }
    }

  }

  /* Методы, относящиеся к лекциям */

  addLecture(lecture, silent) {
    if(this.checkLecture(lecture)) {
      if(this.placeIsCapable(lecture.place, lecture.schools)) {
        if(this.placeIsFree(lecture.place, lecture.dateFrom, lecture.duration)) {
          this.lectures.push(lecture);
          silent || console.info('Лекция "' + lecture.name + '" добавлена успешно')
          return true;
        }
        else {
          silent || console.error('Ошибка: аудитория "' + lecture.place + '" в желаемое время занята, добавление лекции "' + lecture.name + '" невозможно.')
          return false;
        }
      }
      else {
        silent || console.error('Ошибка: в аудитории "' + lecture.place + '" недостаточно мест, добавление лекции "' + lecture.name + '" невозможно.')
        return false;
      }
    }
    else {
      silent || console.error('Ошибка: лекция "' + lecture.name + '" не добавлена, проверьте данные.')
      return false;
    }
  }

  deleteLecture(lectureName, silent, editor) {
    let lectureToDelete = this.getLecture(lectureName);
    if(!lectureToDelete) {
      console.error('Ошибка: Лекция "' + lectureName + '" не существует');
      return false;
    }
    this.lectures.splice(this.lectures.indexOf(lectureToDelete), 1);
    silent || console.info('Лекция "' + lectureName + '" успешно удалена')
    return true;
  }

  editLecture(lectureName, changes, silent) {
    let lectureToChange = this.getLecture(lectureName);
    let lectureClone = JSON.parse(JSON.stringify(lectureToChange));
    if(changes && lectureToChange) {
      let lectureProperties = ['name', 'lecturer', 'dateFrom', 'duration', 'place', 'schools'];
      for (var lectureProp in changes) {
        if (changes.hasOwnProperty(lectureProp) && lectureProperties.indexOf(lectureProp) !== -1) {
          lectureClone[lectureProp] = changes[lectureProp];
        }
      }
    }
    else if(!lectureToChange){
      silent || console.error('Ошибка: Лекция "' + schoolName + '" не найдена')
      return false;
    }
    if (this.checkLecture(lectureClone)) {
      this.deleteLecture(lectureName, true, true);
      this.addLecture(lectureClone, true);
      silent || console.info('Лекция "' + lectureName + '" изменена. Теперь она называется "' + lectureClone.name + '"');
      return true;
    }
    else {
      silent || console.error('Изменения, внесённые в лекцию "' + lectureName + '" недопустимы. Исправьте ошибки и попробуйте снова.');
      return false
    }
  }

  getLecture(name) {
    return this.lectures.find((lecture) => {
      if(lecture.name === name) {
        return lecture;
      }
      return false;
    }) || false;
  }

  checkLecture(lecture) {
    if (
      (typeof lecture.name === 'string' || lecture.name instanceof String) &&
      (typeof lecture.lecturer === 'string' || lecture.name instanceof String) &&
      (typeof lecture.duration === 'number' || lecture.duration instanceof Number) &&
      this.getPlace(lecture.place) &&
      lecture.schools.length &&
      lecture.schools.every((school) => { return this.getSchool(school) }) &&
      moment(lecture.dateFrom).isValid() &&
      !this.getLecture(lecture.name)
    ){ // Если вся инфа о школах заполнена как надо,
      if (!this.getLecture(lecture.name)) { // и такой школы не существует
        return true;
      }
    }
    return false;
  }

  /* Методы, относящиеся к школам */

  addSchool(school, silent) {
    if(this.checkSchool(school)) {
      this.schools.push(school); // Кладём школу в массив школ
      silent || console.info('Школа "' + school.name + '" успешно добавлена')
      return true;
    }
    else {
      silent || console.error('Ошибка: школа "' + school.name + '" не добавлена, проверьте данные')
      return false;
    }
  }

  deleteSchool(schoolName, silent, editor) {
    let schoolToDelete = this.getSchool(schoolName);
    if(schoolToDelete) {
      // TODO: delete all school references from lectures
      !silent && !editor ? console.warn('При удалении школы будут удалены и лекции, проводимые только для этой школы') : null;
      if(!editor) {
        let schoolLectures = this.lectures.filter((lecture) => {
          if (lecture.schools.indexOf(schoolName) !== -1) {
            return true;
          }
          return false;
        });
        schoolLectures.forEach((lecture) => {
          if(lecture.schools.length === 1) {
            this.deleteLecture(lecture.name, true);
          }
          else {
            lecture.schools.splice(lecture.schools.indexOf(schoolName), 1);
          }
        });
      }
      this.schools.splice(this.schools.indexOf(schoolToDelete), 1);
      silent || console.info('Школа "' + schoolName + '" успешно удалена')
      return true;
    }
    return false;
  }

  editSchool(schoolName, changes, silent) {
    let schoolToChange = this.getSchool(schoolName);
    let schoolClone =  JSON.parse(JSON.stringify(schoolToChange));
    if(changes && schoolToChange) {
      schoolClone.name = changes.name;
      schoolClone.students = changes.students;
    }
    else if(!schoolToChange){
      silent || console.error('Ошибка: Школа "' + schoolName + '" не найдена')
      return false;
    }
    if(this.checkSchool(schoolClone)) {
      let lecturesForSchool = this.lectures.filter((lecture) => {
        if (lecture.schools.indexOf(schoolName) !== -1){
          return true;
        }
        return false;
      });
      if (lecturesForSchool.length > 0) {
        lecturesForSchool.forEach((lecture) => {
          let newSchools = lecture.schools.slice(0);
          newSchools.splice(lecture.schools.indexOf(schoolName), 1, schoolClone);

          if(!this.placeIsCapable(lecture.place, newSchools)){
            throw new Error('Ошибка: аудитория "' + lecture.place + '" не может вместить в себя ' + schoolClone.students + ' студентов');
          }
          lecture.schools[lecture.schools.indexOf(schoolName)] = schoolClone.name;
        })
      }
      this.deleteSchool(schoolName, true, true);
      this.addSchool(schoolClone, true);
      !silent ?console.info('Школа "' + schoolName + '" изменена. Теперь она называется "' + schoolClone.name + '" и в ней ' + schoolClone.students + ' студентов ') : null;
      return true;
    }
  }

  getSchool(name) {
      return this.schools.find((school) => {
        if (school.name === name) {
          return school;
        }
        return false;
      }) || false;
  }

  checkSchool(school) {
    if (typeof school.name === 'string' && typeof school.students === 'number'
        && school.students >= 1) { // Если вся инфа о школах заполнена как надо,
      if (!this.getSchool(school.name)) { // и такой школы не существует
        return true;
      }
    }
    return false;
  }

  schoolSchedule(school, dateFrom, dateTo) {
    if (typeof school === 'string' || school instanceof String) {
      school = this.getSchool(school);
    }
    let schedule = this.lectures.filter((lecture) => {
      if (lecture.schools.indexOf(school.name) !== -1) {
        return true;
      }
      return false;
    });
    if (dateFrom && moment(dateFrom).isValid() && !dateTo) {
      schedule = schedule.filter((lecture) => {
        if (moment(lecture.dateFrom).isSameOrAfter(dateFrom)) {
          return true;
        }
        return false;
      })
    }
    if (dateFrom && dateTo && moment(dateFrom).isValid() && moment(dateTo).isValid()) {
      schedule = schedule.filter((lecture) => {
        if (moment(lecture.dateFrom).isBetween(dateFrom, dateTo, null, '[]')) {
          return true;
        }
        return false;
      })
    }

    schedule.sort((curr, next) => {
      return moment(curr.dateFrom).isAfter(next.dateFrom);
    })
    return schedule;
  }


  /* Аудитории */

  addPlace(place, silent) {
    if(this.checkPlace(place)) {
      this.places.push(place); // Кладём школу в массив школ
      silent || console.info('Аудитория "' + place.name + '" успешно добавлена')
      return true;
    }
    else {
      silent || console.error('Ошибка: аудитория "' + place.name + '" не добавлена, проверьте данные')
      return false;
    }
  }

  deletePlace(placeName, silent, editor) {
    let placeToDelete = this.getPlace(placeName);
    if(placeToDelete) {
      // TODO: delete all lectures in this place

      if(!editor) {
        silent || console.warn('При удалении аудитории будут удалены все лекции, проводимые в этой аудитории')

        let placeLectures = this.lectures.filter((lecture) => {
          if (lecture.place === placeName) {
            return true;
          }
        });
        placeLectures.every((lecture) => {
          this.deleteLecture(lecture.name);
        })
      }

      this.places.splice(this.places.indexOf(placeToDelete),1);

      silent || console.info('Аудитория "' + placeName + '" успешно удалена')
      return true;
    }
    silent || console.error('Ошибка: Аудитория "' + placeName + '" не найдена')
    return false;
  }

  editPlace(placeName, changes, silent) {
    let placeToChange = this.getPlace(placeName);
    let placeClone =  JSON.parse(JSON.stringify(placeToChange));
    if(changes && placeToChange) {
        placeClone.name = changes.name;
        placeClone.capacity = changes.capacity;
    }
    else if(!placeToChange){
      silent || console.error('Ошибка: Аудитория "' + placeName + '" не найдена')
      return false;
    }

    if(this.checkPlace(placeClone, true)) {
      let lecturesForPlace = this.lectures.filter((lecture) => {
        if (lecture.place === placeName){
          return true;
        }
        return false;
      });
      if (lecturesForPlace.length > 0) {
        lecturesForPlace.forEach((lecture) => {

          if(!this.placeIsCapable(placeClone, lecture.schools)){
            let students;
            if (lecture.schools.length > 1) {
              students = lecture.schools.reduce((prev, next) => {
                next = this.getSchool(next);
                if(typeof prev === 'string' || prev instanceof String) {
                  prev = this.getSchool(prev);
                }
                return prev.students + next.students;
              });
              console.log(students);
            }
            else {
              students = this.getSchool(lecture.schools[0]).students;
            }
            throw new Error('Ошибка: аудитория "' + placeClone.name + '" не может вместить в себя ' + students + ' студентов');
          }
          lecture.place = placeClone.name;
        })
      }
      this.deletePlace(placeName, true);
      this.addPlace(placeClone, true);
      silent || console.info('Аудитория "' + placeName + '" изменена. Теперь она называется "' + placeClone.name + '" и в неё помещается ' + placeClone.capacity + ' человек')
      return true;
    }
  }

  getPlace(name) {
    return this.places.find((place) => {
        if (place.name === name) {
          return place;
        }
        return false;
      }) || false;
  }

  checkPlace(place, editor) {
    if (typeof place.name === 'string' && typeof place.capacity === 'number'
        && place.capacity >= 1) { // Если вся инфа о школах заполнена как надо,
      if (!this.getPlace(place.name)) { // и такой школы не существует
        return true;
      }
      else if (editor) {
        return true;
      }
    }
    return false;
  }

  placeIsCapable(place, schools) {
    // проверяем, не попала ли случайно в первый параметр строка с названием аудитории
    if (typeof place === 'string' || place instanceof String) {
      place = this.getPlace(place);
    }

    schools = schools.map((school) => {
      if(typeof school === 'string' || school instanceof String) {
        let newSchool = this.getSchool(school);
        if (newSchool) {
          return newSchool;
        }
        throw new Error('Школы "' + school + '" не существует');
      }
      else if(typeof school === 'object' || school instanceof Object) {
        return school;
      }
    });

    if (place.capacity >= schools.reduce((prev, current, a, b, c) => {
      return { students: prev.students + current.students }
    }).students) {
      return true;
    }
    return false;
  }

  placeIsFree(place, dateFrom, duration) {
    if(typeof place === 'string' || place instanceof String) {
      place = this.getPlace(place);
    }
    if(typeof dateFrom === 'string' || place instanceof String) {
      if (!moment(dateFrom).isValid()) {
        throw new Error('Неверный формат даты');
      }
      dateFrom = moment(dateFrom);
    }

    let dateTo = moment(dateFrom).add(duration, 'm');

    let allLectures = this.lectures.filter((lecture) => {
      if (lecture.place === place.name) {
        return true;
      }
    });

    allLectures = allLectures.filter((lecture) => {
      // console.log(dateTo, moment(lecture.dateFrom).toString(), dateTo.toString(), moment(lecture.dateFrom).add(lecture.duration).toString());
      // console.log(dateTo >= moment(lecture.dateFrom), dateTo.toString(), moment(lecture.dateFrom).add(lecture.duration).toString());
      if(dateFrom.isBetween(moment(lecture.dateFrom), moment(lecture.dateFrom).add(lecture.duration, 'm'), null,'[)') ||
         dateTo.isBetween(moment(lecture.dateFrom), moment(lecture.dateFrom).add(lecture.duration, 'm'), null, '(]')) {
           return true;
      }
    })

    if(allLectures.length > 0) {
      return false;
    }
    return true;
  }
}

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
      capacity: 160
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

// console.log(mobilization2017.placeIsCapable(mobilization2017.getPlace('Синий Кит'), [mobilization2017.getSchool('ШРИ'), mobilization2017.getSchool('ШМД')]));
// console.log(mobilization2017.placeIsCapable('Синий Кит', [mobilization2017.getSchool('ШРИ'), mobilization2017.getSchool('ШМД')]));
// console.log(mobilization2017.placeIsCapable('Синий Кит', ['ШРИ', 'ШМР', 'ШМД']));

let lecture = {
  name: 'Адаптивный дизайн и вёрстка',
  lecturer: 'Антон Пемп',
  dateFrom: '2017-06-06 19:00',
  duration: 90,
  place: 'Синий Кит',
  schools: ['ШРИ', 'ШМД']
};

let school = {
  name: 'Академия Гипербатона',
  students: 666
}

mobilization2017.editLecture('Крутая лекция на все школы', lecture, false)

// mobilization2017.addLecture(lecture);

// console.log(mobilization2017.placeIsFree('Синий Кит', '2017-06-03 19:00', 90));
// console.log(mobilization2017.placeIsFree('Синий Кит', '2017-08-03 19:00', 90));

// console.log(lecture);
// mobilization2017.addSchool(school);
// mobilization2017.editSchool('ШМД', {
//   name: 'Школа Мобильного Дизайна',
//   students: 20
// });
// mobilization2017.editSchool('ШРИ', {
//   name: 'Школа Разработки Интерфейсов'
// });
// mobilization2017.editSchool('ШМР', {
//   name: 'Школа Мобильной Разработки'
// });
// mobilization2017.editSchool('Академия Гипербатона', {
//   students: 40
// })

// console.log(mobilization2017.getPlace('Синий Кит'));

// mobilization2017.editPlace('Мулен Руж', {
//   name: 'Два ствола',
//   capacity: 65
// })
// console.log(mobilization2017.editPlace('Мулен Руж', {
//   name: 'Два ствола'
// }));

// console.log(moment());

console.log(mobilization2017.schoolSchedule('ШРИ', '2017-02-04', '2018-02-11'));

// mobilization2017.deletePlace('Синий Кит');


// mobilization2017.deleteSchool('Школа Разработки Интерфейсов');

// console.log(mobilization2017.lectures);

// mobilization2017.deleteLecture('Крутая лекция на все школы');



// console.log(mobilization2017.lectures);
// console.log(mobilization2017.places);
// console.log(mobilization2017.schools);
