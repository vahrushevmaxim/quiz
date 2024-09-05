document.addEventListener('DOMContentLoaded', function () {

    class Quiz {
        constructor(app, arrayQuestions, arrayAnswers) {
            if (!app || arrayQuestions) return
            this.app = document.querySelector(app);//Корневой dom элемент
            this.arrayQuestions = arrayQuestions;//Массив вопросов
            this.arrayAnswers = arrayAnswers;//Массив ответов
            this.sumQuestion = this.arrayQuestions.length;//Длина массива вопросов
            this.numberQuestion = 0;//Номер вопроса
            this.completedQuestion = 1;//Номер текущего вопроса
            this.delay = 1000;//Задержка перед некст вопросом
            this.isAnswered = false;//Флаг для блокирования кликов,когда идет задержка перед некст вопросом
            this.arrayAnswersUsers = [];//Массив с ответами юзера
            this.app.innerHTML = `
            <div class="app-quiz">
                <div class="app-quiz__wrapper">
                    <h1 class="title-big app-quiz__title" data-title-question>Тестирование</h1>
                    <p class="app-quiz__text-result" data-text-result-question></p>
                    <div class="app-quiz__body">
                    <div class="app-quiz__content">
                    <form class="form-main">
                        <h2 class="title-middle app-quiz__subtitle" data-name-question></h2>
                        <ul class="form-main__list-items" data-content-question>
                        </ul>
                        </form>
                    </div>
                    <div class="progress-bar" data-progressbar-question>
                        <span class="progress-bar__number progress-bar__number--left">0</span>
                        <span class="progress-bar__fill-scale" data-progress-question>
                            <span class="progress-bar__number progress-bar__number--sum" data-current-question>${this.completedQuestion}</span>
                        </span>
                        <span class="progress-bar__number progress-bar__number--right" data-sum-question>${this.sumQuestion}</span>
                    </div>
                    </div>
                    <div class="app-quiz__cards" data-cards-question></div>
                </div>
            </div>
            `
            //ПОЛУЧАЕМ ВСЕ ЭЛЕМЕНТЫ ДЛЯ ВЗАИМОДЕЙСТВИЯ С НИМИ
            this.nameQuestion = this.app.querySelector("[data-name-question]");
            this.contentQuestion = this.app.querySelector("[data-content-question]");
            this.progressBar = this.app.querySelector("[data-progressbar-question]");
            this.progressBarLine = this.app.querySelector("[data-progress-question]");
            this.numberCurrentQuestion = this.app.querySelector("[data-current-question]");
            this.sumQuestions = this.app.querySelector("[data-sum-question]");
            this.bodyQuestions = this.app.querySelector(".app-quiz__body");
            this.cardsResult = this.app.querySelector("[data-cards-question]");
            this.textResult = this.app.querySelector("[data-text-result-question]");
            this.titleQuestion = this.app.querySelector("[data-title-question]");
            this.shuffleArray(this.arrayQuestions);//Перемешиваем вопросы
            this.renderQuestion();//Загрузка первого вопроса
        }

        shuffleArray(array) {//Функция рандома
            let i = array.length - 1;
            while (i > 0) {
                let j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
                i--;
            }
        }

        repeatQuiz() {//Функция возврата к первому вопросу
            this.app.querySelector("[data-button-repeat-question]").addEventListener("click", (e) => {
                e.preventDefault();
                this.cardsResult.innerHTML = "";
                this.bodyQuestions.style.display = "block";
                this.textResult.innerText = "";
                this.textResult.classList.remove("app-quiz__text-result--active");
                e.target.closest(".app-quiz__bot").remove();
                this.titleQuestion.innerText = "Тестирование";
                this.numberQuestion = 0;
                this.completedQuestion = 1;
                this.arrayAnswersUsers = [];
                this.isAnswered = false;
                this.shuffleArray(this.arrayQuestions);
                this.renderQuestion();
            });
        }

        setEventOnInput(question, options, id) {//Функция установки события клика на отрендаренные пункты (варианты ответа)
            let itemsInputs = this.app.querySelectorAll("[data-answer-question]");
            itemsInputs.forEach((item) => {
                item.addEventListener("click", (e) => {
                    if (this.isAnswered) return;
                    this.arrayAnswersUsers.push({
                        question,
                        answer: options[item.value].answer,
                        id_answer: Number(item.getAttribute("data-id")),
                        id_question: id
                    })
                    this.numberQuestion += 1;
                    if (this.sumQuestion <= this.numberQuestion) {
                        this.setDelay(() => {
                            this.isAnswered = true;
                            this.showResultQuiz();
                        });
                        return
                    }
                    this.isAnswered = true;
                    this.setDelay(() => {
                        this.renderQuestion();
                        this.isAnswered = false;
                    });
                });
            });
        }

        showResultQuiz() {//Функция для показа результата квиза
            let correct = 0;
            let inCorrect = 0;

            const showTextResul = (title, description,) => {
                this.titleQuestion.innerText = title;
                this.textResult.innerText = description;
                this.textResult.classList.add("app-quiz__text-result--active");
                if (inCorrect != 0 || correct != 0) {
                    this.cardsResult.insertAdjacentHTML("afterend", `
                    <div class="app-quiz__bot">
                        <button class="button-action" data-button-repeat-question>
                            <span class="button-action__text">Пройти еще раз</span>
                        </button>
                    </div>
                `)
                }
            }

            let cardsResult = "";

            this.arrayAnswersUsers.forEach((item, index) => {
                let answerData = this.arrayAnswersUsers[index]
                let correctAnswer = this.arrayAnswers[answerData.id_question - 1]
                let result = answerData.id_answer === correctAnswer.answer;
                if (result) correct += 1;
                if (!result) inCorrect += 1;
                cardsResult += `
                <div class="card-item ${result ? "card-item--correct" : "card-item--error"}">
                    <div class="card-item__content">
                        <h3 class="title-small card-item__title">${answerData.question}</h3>
                        <p class="card-item__text">${answerData.answer}</p>
                    </div>
                </div>
                `
            });

            if (correct === 0) {
                showTextResul(
                    "Упс :(",
                    "Вы неправильно ответили на все вопросы.Нужно подучить теорию."
                )
                this.repeatQuiz();
                correct = 0;
                inCorrect = 0;
            } else if (inCorrect === 0) {
                showTextResul(
                    "Поздравляем!",
                    "Вы правильно ответили на все вопросы.Вы действительно отлично разбираетесь в IT."
                )
            } else {
                showTextResul(
                    "Хороший результат!",
                    `Вы ответили правильно на ${correct} вопросов.Так держать!`
                )
                this.repeatQuiz();
                correct = 0;
                inCorrect = 0;
            }

            this.bodyQuestions.style.display = "none";
            this.cardsResult.innerHTML = cardsResult;
        }

        setDelay(callback) {//Функция задержки
            setTimeout(callback, this.delay);
        }

        renderQuestion() {//Функция рендер вопроса на страницу,так же при ее вызове вызывается Функция ,которая мешает варианты ответа
            this.contentQuestion.innerHTML = "";
            let { question, options, id } = this.arrayQuestions[this.numberQuestion];
            this.shuffleArray(options);
            this.nameQuestion.innerText = question;
            let answers = "";
            options.forEach(({ answer, id }, index) => {
                answers += `
                <li class="form-main__item">
                    <label class="form-main__row">
                        <input data-answer-question type="radio" class="form-main__input" data-id="${id}" name="answer" value="${index}">
                        <span class="form-main__input-custom"></span>
                        <span class="form-main__text">${answer}</span>
                    </label>
                </li>
                `;
            });
            this.contentQuestion.innerHTML = answers;
            this.setEventOnInput(question, options, id);
            this.setProgressBar();
        }

        setProgressBar() {//Функция для работы прогресс бара
            this.numberCurrentQuestion.innerText = this.completedQuestion;
            let step = Math.round((this.completedQuestion / this.sumQuestion) * 100);
            this.progressBarLine.style.width = step + "%"
            this.completedQuestion += 1;
        }
    }

    const questions = [
        {
            id: 1,
            question: "Что такое операционная система?",
            options: [
                {
                    answer: "Это просто программа на компьютере, как и другие - Word или Chrome",
                    id: 1
                },
                {
                    answer: "Это показатель того, какой процессор используется на компьютере. Например, 32-битный или 64-битный",
                    id: 2
                },
                {
                    answer: "Это набор взаимосвязанных программ, осуществляющих управление компьютером и взаимодействие с пользователем",
                    id: 3
                },
                {
                    answer: `Нет такого понятия, есть понятие "файловая система"`,
                    id: 4
                }
            ]
        },
        {
            id: 2,
            question: "Является ли Android операционной системой?",
            options: [
                {
                    answer: "Да, это такая же ОС, как и другие, просто для мобильных девайсов",
                    id: 1
                },
                {
                    answer: "Нет, операционные системы бывают только для ПК",
                    id: 2
                },
                {
                    answer: "Нет, Android это программа, которая ставится на операционную систему девайса. ОС на разных девайсах разные",
                    id: 3
                },
                {
                    answer: "Это домашняя страничка в настройках вашего браузера",
                    id: 4
                }
            ]
        },
        {
            id: 3,
            question: "Что такое процессор компьютера?",
            options: [
                {
                    answer: "Это блок, внутри которого находится дисковод и много разъемов для монитора, клавиатуры и компьютерной мышки",
                    id: 1
                },
                {
                    answer: "Это общее название всех комплектующих компьютера",
                    id: 2
                },
                {
                    answer: "Это элемент компьютера, с помощью которого обрабатывается информация, находящаяся как в собственной памяти, так и в памяти других устройств",
                    id: 3
                },
                {
                    answer: "Это суммарный показатель вычислительной мощности компьютера, например 2,7 ГГц",
                    id: 4
                }
            ]
        },
        {
            id: 4,
            question: "Какие бывают разрядности у современных процессоров?",
            options: [
                {
                    answer: "32 и 64 бита",
                    id: 1
                },
                {
                    answer: "12 и 32 бита",
                    id: 2
                },
                {
                    answer: "15 и 32 бита",
                    id: 3
                },
                {
                    answer: "86 и 64 бита",
                    id: 4
                }
            ]
        },
        {
            id: 5,
            question: "Какой тип процессора чаще всего используют мобильные девайсы?",
            options: [
                {
                    answer: "iOS использует Intel, остальные используют AMD",
                    id: 1
                },
                {
                    answer: "Чаще всего используют Intel",
                    id: 2
                },
                {
                    answer: "Чаще всего используют AMD",
                    id: 3
                },
                {
                    answer: "Чаще всего используют ARM",
                    id: 4
                }
            ]
        },
        {
            id: 6,
            question: "Для чего компьютеру нужна RAM?",
            options: [
                {
                    answer: "Для быстрого доступа к данным",
                    id: 1
                },
                {
                    answer: "Для долгосрочного хранения данных",
                    id: 2
                },
                {
                    answer: "Для правильной фрагментации памяти",
                    id: 3
                },
                {
                    answer: "Для дефрагментации данных",
                    id: 4
                }
            ]
        },
        {
            id: 7,
            question: "Чем отличается HDD от SSD?",
            options: [
                {
                    answer: "HDD - это твердотельный накопитель без подвижных частей. Более дешевый, чем SSD. HDD работает быстрее",
                    id: 1
                },
                {
                    answer: "HDD - это твердотельный накопитель без подвижных частей. Более дорогой, чем SSD. HDD работает быстрее",
                    id: 2
                },
                {
                    answer: "SSD - это твердотельный накопитель без подвижных частей. Более дешевый, чем HDD. SSD работает быстрее",
                    id: 3
                },
                {
                    answer: "SSD - это твердотельный накопитель без подвижных частей. Более дорогой, чем HDD. SSD работает быстрее",
                    id: 4
                }
            ]
        },
        {
            id: 8,
            question: "Как отличаются между собой USB?",
            options: [
                {
                    answer: "Бывают только USB 2.0 и 3.2",
                    id: 1
                },
                {
                    answer: "Бывают только micro-USB и mini-USB",
                    id: 2
                },
                {
                    answer: "USB отличаются по пропускной способности (micro-USB, mini-USB, lightning и т.д.) и форме (USB 2.0, USB 3.2).",
                    id: 3
                },
                {
                    answer: "USB отличаются по форме (micro-USB, mini-USB, lightning и т.д.) и пропускной способности (USB 2.0, USB 3.2)",
                    id: 4
                }
            ]
        },
        {
            id: 9,
            question: "Какой файловой системы не существует?",
            options: [
                {
                    answer: "Fat",
                    id: 1
                },
                {
                    answer: "NTFS",
                    id: 2
                },
                {
                    answer: "APFS",
                    id: 3
                },
                {
                    answer: "BolSFS",
                    id: 4
                }
            ]
        }
    ];

    const answers = [
        {
            id: 1,
            question: "Что такое операционная система?",
            answer: 3,
            text: "Это набор взаимосвязанных программ, осуществляющих управление компьютером и взаимодействие с пользователем"
        },
        {
            id: 2,
            question: "Является ли Android операционной системой?",
            answer: 1,
            text: "Да, это такая же ОС, как и другие, просто для мобильных девайсов"
        },
        {
            id: 3,
            question: "Что такое процессор компьютера?",
            answer: 3,
            text: "Это элемент компьютера, с помощью которого обрабатывается информация, находящаяся как в собственной памяти, так и в памяти других устройств"
        },
        {
            id: 4,
            question: "Какие бывают разрядности у современных процессоров?",
            answer: 1,
            text: "32 и 64 бита"
        },
        {
            id: 5,
            question: "Какой тип процессора чаще всего используют мобильные девайсы?",
            answer: 4,
            text: "Чаще всего используют ARM"
        },
        {
            id: 6,
            question: "Для чего компьютеру нужна RAM?",
            answer: 1,
            text: "Для быстрого доступа к данным"
        },
        {
            id: 7,
            question: "Чем отличается HDD от SSD?",
            answer: 4,
            text: "SSD - это твердотельный накопитель без подвижных частей. Более дорогой, чем HDD. SSD работает быстрее"
        },
        {
            id: 8,
            question: "Как отличаются между собой USB?",
            answer: 4,
            text: "USB отличаются по форме (micro-USB, mini-USB, lightning и т.д.) и пропускной способности (USB 2.0, USB 3.2)"
        },
        {
            id: 9,
            question: "Какой файловой системы не существует?",
            answer: 4,
            text: "BolSFS"
        }
    ]

    const instanceQuiz = new Quiz("#app", questions, answers);

});