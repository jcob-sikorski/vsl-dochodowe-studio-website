import React from "react";

interface DueDiligenceItem {
  id: string;
  categoryNumber: string;
  title: string;
  subtitle: string;
  badge?: string;
  questions: {
    q: string;
    a: React.ReactNode;
  }[];
}

const DUE_DILIGENCE_DATA: DueDiligenceItem[] = [
  {
    id: "legitimacy",
    categoryNumber: "01",
    title: "Wiarygodność i dane rejestrowe",
    subtitle: "Czy istniejemy naprawdę, jesteśmy zarejestrowani i bierzemy odpowiedzialność?",
    badge: "ZWERYFIKOWANY PODMIOT",
    questions: [
      {
        q: "Czy ci ludzie w ogóle istnieją i czy kogoś oszukali?",
        a: (
          <>
            <p>
              Tak, prowadzimy w pełni zarejestrowaną działalność z zerową liczbą sporów prawnych czy zarzutów o oszustwo. Zachęcamy do sprawdzenia oficjalnych rejestrów, weryfikacji danych i przejrzenia udokumentowanych wyników naszych klientów, zanim wydasz choćby złotówkę.
            </p>
            <p className="mt-1.5 font-medium text-neutral-900">
              NIP: <span className="font-mono">8281424752</span>
            </p>
          </>
        ),
      },
      {
        q: "Czy adres siedziby i dane firmy są prawdziwe?",
        a: (
          <>
            <p>
              Nie ukrywamy się za wirtualnymi biurami czy anonimowymi skrytkami pocztowymi. Nasza firma jest zarejestrowana pod adresem: <strong>ul. Partyzantów 42B, 99-200 Poddębice</strong>.
            </p>
            <p className="mt-1.5 text-neutral-600">
              Prowadzimy realne, fizyczne studia treningowe, w których codziennie pracujemy z klientami. Poniżej znajdziesz bezpośrednie lokalizacje naszych obiektów w Google Maps.
            </p>
          </>
        ),
      },
    ],
  },
  {
    id: "pricing",
    categoryNumber: "02",
    title: "Dlaczego za darmo i gdzie jest haczyk?",
    subtitle: "Uczciwe wyjaśnienie naszego modelu i dlaczego nie pobieramy opłaty.",
    questions: [
      {
        q: "Dlaczego to szkolenie jest w 100% darmowe? Gdzie jest haczyk?",
        a: (
          <>
            Stawiamy sprawę jasno: <strong>to nasza najlepsza forma marketingu, ponieważ to szkolenie przynosi nam klientów</strong>. Wychodzimy z prostego założenia – najpierw udowadniamy naszą wartość w praktyce, zamiast tylko o niej mówić. Jeśli dostarczymy Ci potężną dawkę wiedzy i konkretny plan, część uczestników będzie chciała wdrożyć to z naszą bezpośrednią pomocą. Jeśli zdecydujesz się zrobić wszystko sam – masz kompletną wiedzę za 0 zł. Obie strony wygrywają.
          </>
        ),
      },
      {
        q: "Czym to się różni od darmowych materiałów na YouTube?",
        a: (
          <>
            Na YouTube znajdziesz masę chaotycznej teorii i ogólnych porad od osób, które często nie prowadzą realnego biznesu. Tutaj nie tracisz tygodni na sklejanie pojedynczych wskazówek – dostajesz gotowy, przetestowany proces krok po kroku, nasze wewnętrzne procedury oraz sprawdzone rozwiązania, które działają w praktyce tu i teraz.
          </>
        ),
      },
    ],
  },
  {
    id: "risk-and-guarantee",
    categoryNumber: "03",
    title: "Ryzyko i gwarancja zwrotu",
    subtitle: "Zasady zwrotów, dokument, który je reguluje, i twarde liczby zamiast obietnic.",
    badge: "< 1% SPORÓW",
    questions: [
      {
        q: "Czy oferujecie realną gwarancję zwrotu pieniędzy, czy to marketingowy chwyt?",
        a: (
          <>
            Oferujemy bezdyskusyjną, pełną gwarancję na min. 20 tys. zł miesięcznie ZYSKU. Mówiąc zupełnie wprost: <strong>jedyne osoby, które u nas proszą o zwrot pieniędzy, to takie, którym po prostu przeszkodziło życie</strong> – nagłe sytuacje losowe, zdrowotne czy rodzinne. Żaden system, strategia ani najlepsze know-how na świecie tego nie zmieni, jeśli nagłe okoliczności całkowicie krzyżują plany. W takich sytuacjach zawsze zachowujemy się w 100% fair i zwracamy środki bez zbędnych pytań.
          </>
        ),
      },
      {
        q: "Jak dokładnie wygląda ta gwarancja — jaki dokument to reguluje i kto ocenia, że „zrobiłem wszystko zgodnie z systemem”?",
        a: (
          <>
            Warunki gwarancji są spisane w umowie, którą otrzymujesz przed startem współpracy – to nie są ustne obietnice. Ocena wdrożenia opiera się na wspólnie ustalonych, mierzalnych krokach, a nie subiektywnym „czy się starałeś”, a zwroty faktycznie miały miejsce w sytuacjach, gdy nagłe okoliczności uniemożliwiły dalsze prowadzenie studia.
          </>
        ),
      },
      {
        q: "Co jeśli to nie zadziała i zostanę z niczym?",
        a: (
          <>
            Nasz wskaźnik sporów i reklamacji wynosi poniżej 0,1%. Prowadzimy fizyczne, stacjonarne studia treningowe i oficjalnie zarejestrowaną spółkę w Polsce – podpisujemy się pod tym własnym nazwiskiem i twarzą. Nie jesteśmy anonimowym kursem z internetu, który znika po kilku tygodniach. Twoje bezpieczeństwo i nasza wieloletnia reputacja są na pierwszym miejscu.
          </>
        ),
      },
      {
        q: "Czy 20–50 tys. zł to zysk przed czy po podatkach, i czy wlicza się w to moje własne wynagrodzenie jako właściciela?",
        a: (
          <>
            Mówimy o czystym zysku operacyjnym studia, przed opodatkowaniem – dokładnie tak, jak liczy się rentowność każdego biznesu. Twoje wynagrodzenie jako właściciela wypłacasz sobie z tej kwoty w formie zgodnej z wybraną strukturą prawną działalności – to już kwestia księgowa, którą ustalasz z własnym księgowym.
          </>
        ),
      },
    ],
  },
  {
    id: "capital-and-transition",
    categoryNumber: "04",
    title: "Kapitał, budżet reklamowy i Twój dochód w trakcie zmiany",
    subtitle: "Konkretne liczby zamiast ogólników o inwestycji na starcie.",
    questions: [
      {
        q: "Ile kapitału startowego realnie muszę mieć, zanim zobaczę pierwszy zysk?",
        a: (
          <>
            To zależy od tego, czy zaczynasz od zera, czy masz już działające studio – dlatego to jedno z pierwszych pytań, które zadajemy na konsultacji, zamiast podawać jedną magiczną liczbę dla wszystkich. Model jest zaprojektowany tak, by minimalizować zbędne wydatki na starcie i skupiać kapitał tam, gdzie realnie generuje zwrot.
          </>
        ),
      },
      {
        q: "Ile realnie muszę wydać na reklamę, żeby to ruszyło, i czy ten koszt jest wliczony w kalkulację zysku?",
        a: (
          <>
            Budżet marketingowy jest wliczony w kalkulację rentowności studia, a nie traktowany jako dodatkowy, ukryty koszt – na konsultacji omawiamy realne widełki wydatków dopasowane do Twojego miasta i etapu rozwoju biznesu.
          </>
        ),
      },
      {
        q: "Co się stanie z moim obecnym dochodem z treningów personalnych w trakcie przechodzenia na model studia — czy będzie okres, w którym zarabiam mniej niż teraz?",
        a: (
          <>
            Proces jest zaprojektowany tak, żeby delegować obowiązki stopniowo, a nie z dnia na dzień porzucać obecnych klientów – dzięki temu w większości przypadków nie ma gwałtownego spadku dochodu. Mogą zdarzyć się tygodnie przejściowe, w których organizujesz zespół i procedury, ale to element planu, o którym mówimy wprost, a nie coś, co Cię zaskoczy.
          </>
        ),
      },
    ],
  },
  {
    id: "timeline",
    categoryNumber: "05",
    title: "Harmonogram i efekty",
    subtitle: "Wymagany czas i realne tempo osiągania rezultatów.",
    questions: [
      {
        q: "Ile czasu zajmuje proces i kiedy pojawią się pierwsze rezultaty?",
        a: (
          <>
            To zależy od specyfiki Twojej sytuacji i punktu wyjścia – realny czas wynosi <strong>od 7 dni do 4 miesięcy, w zależności od skali problemu</strong>. Pierwsze widoczne efekty i wdrożenie podstawowych elementów można zauważyć już w ciągu pierwszych 7 dni, natomiast pełne rozwiązanie problemu i zbudowanie stabilnych, długoterminowych rezultatów wymaga zazwyczaj od 2 do 4 miesięcy systematycznego działania.
          </>
        ),
      },
      {
        q: "Czy to będzie kolidować z moim obecnym grafikiem i obowiązkami?",
        a: (
          <>
            Nie. Całość została zaprojektowana tak, aby dopasować się do Twojego codziennego życia, a nie wywracać je do góry nogami. Działamy w oparciu o konkretne, poukładane kroki, które wdrażasz bez konieczności poświęcania dziesiątek godzin tygodniowo.
          </>
        ),
      },
    ],
  },
  {
    id: "proof-and-verification",
    categoryNumber: "06",
    title: "Skuteczność, dowody i weryfikacja",
    subtitle: "Rzetelne liczby i pełna możliwość sprawdzenia ich na własną rękę.",
    badge: "50/50 PLACÓWEK",
    questions: [
      {
        q: "Czy Wasze case study i liczby są sztucznie wyselekcjonowane?",
        a: (
          <>
            Nie pokazujemy pojedynczych „szczęśliwych trafów” ani sztucznie napompowanych przychodów. Sprawa wygląda tak: <strong>każda z 50 placówek, która wdrożyła nasz model, przebiła poziom 20 000 zł czystego zysku miesięcznie</strong>. To nie jest kwestia przypadku czy szczęścia do lokalizacji – to powtarzalny, precyzyjnie poukładany proces operacyjny i sprzedażowy.
          </>
        ),
      },
      {
        q: "Jak mogę to zweryfikować przed podjęciem decyzji?",
        a: (
          <>
            Wręcz do tego zachęcamy: <strong>wejdź na nasz profil i napisz bezpośrednio na Instagramie do naszych uczestników</strong>. Nie ukrywamy ich tożsamości – oznaczamy ich w postach i relacjach. Odezwij się do nich na priv, zapytaj bez owijania w bawełnę o realia współpracy, czas wdrożenia i ich obecne liczby. Szczera rozmowa z kimś, kto był dokładnie w Twoim miejscu, to najlepsza możliwa weryfikacja.
          </>
        ),
      },
      {
        q: "Gdzie mogę zobaczyć autentyczne opinie i dowody wyników?",
        a: (
          <>
            Najlepszym miejscem jest Instagram: <strong>prosimy wejść na konto Bartłomieja Sikorskiego i sprawdzić wyróżnione relacje w zakładce „Rezultaty”</strong>. Znajdziesz tam setki bezpośrednich zrzutów ekranu, raportów z systemów, wiadomości od właścicieli studiów oraz oznaczenia profili konkretnych osób, które osiągnęły te wyniki.
          </>
        ),
      },
      {
        q: "Czy te opinie nie są sfałszowane lub kupione?",
        a: (
          <>
            Nie stosujemy anonimowych gwiazdek ani botów z fałszywymi komentarzami. Na profilu Bartłomieja Sikorskiego każde case study to realny człowiek z podanym z imienia i nazwiska kontem na Instagramie. Wejdź na profil Bartłomieja, kliknij w zakładkę z rezultatami i jeśli masz jakiekolwiek wątpliwości – napisz bezpośrednio do którejkolwiek z oznaczonych tam osób.
          </>
        ),
      },
    ],
  },
  {
    id: "mentor-track-record",
    categoryNumber: "07",
    title: "Doświadczenie i wiarygodność mentora",
    subtitle: "Czy Bartłomiej sam to robił, czy tylko o tym opowiada.",
    questions: [
      {
        q: "Czy Bartłomiej faktycznie sam prowadził/prowadzi studio, czy tylko sprzedaje wiedzę teoretyczną?",
        a: (
          <>
            Bartłomiej od lat prowadzi własne studia treningowe i wciąż jest ich współwłaścicielem – to nie jest konsultant z boku, który nigdy nie ryzykował własnych pieniędzy. Model, o którym mówi, to dokładnie ten sam system operacyjny, sprzedażowy i rekrutacyjny, którego sam używa we własnych placówkach.
          </>
        ),
      },
      {
        q: "Czy te 50 placówek to naprawdę niezależni właściciele, czy część z nich to znajomi/rodzina/płatni ambasadorzy?",
        a: (
          <>
            To niezależni właściciele studiów z całej Polski, z którymi nie łączą nas relacje rodzinne ani żadne wynagrodzenie za promowanie wyników. Każdy z nich prowadzi swój własny, publicznie działający biznes pod własnym szyldem – zachęcamy, żebyś napisał bezpośrednio do dowolnej oznaczonej osoby i zapytał wprost, bez naszego pośrednictwa.
          </>
        ),
      },
      {
        q: "Czy mogę porozmawiać z kimś, komu program NIE zadziałał, a nie tylko z historiami sukcesu?",
        a: (
          <>
            Tak, i mówimy o tym otwarcie – powody niepowodzeń zawsze wiążą się z nagłym zdarzeniem losowym (problemy zdrowotne, zamknięcie lokalu, całkowita rezygnacja z prowadzenia biznesu), a nie z wadą samego systemu. Jeśli podczas rozmowy konsultacyjnej zapytasz o kontakt do takiej osoby, jesteśmy gotowi to zorganizować – nie chowamy się za samymi sukcesami.
          </>
        ),
      },
    ],
  },
  {
    id: "fit-for-you",
    categoryNumber: "08",
    title: "Czy to zadziała w mojej konkretnej sytuacji",
    subtitle: "Miasto, nisza i konkurencja — bez uniwersalnych obietnic.",
    questions: [
      {
        q: "Czy to zadziała tylko w dużych miastach, a moje małe miasteczko/wieś to zupełnie inna gra?",
        a: (
          <>
            Wśród 50 placówek, które wdrożyły model, są zarówno studia w dużych miastach, jak i w mniejszych miejscowościach – skala liczby klientów i marży różni się rynkiem, nie zasadą działania. Podczas konsultacji rozmawiamy wprost o realiach Twojej lokalizacji, zamiast obiecywać identyczne liczby niezależnie od miasta.
          </>
        ),
      },
      {
        q: "Czy 20–50 tys. zł zysku jest realne dla mojego miasta, biorąc pod uwagę liczbę mieszkańców i lokalną konkurencję?",
        a: (
          <>
            To zależy od wielkości rynku, konkurencji i etapu, na którym jesteś – dlatego właśnie to pytanie zadajemy na starcie każdej konsultacji, zamiast obiecywać identyczny wynik każdemu, niezależnie od miasta.
          </>
        ),
      },
      {
        q: "Czy rynek nie jest już przesycony trenerami i studiami, i czy jeszcze jest miejsce dla mnie?",
        a: (
          <>
            Rynek indywidualnych trenerów faktycznie jest zatłoczony – ale rynek dobrze zarządzanych, poukładanych studiów z realnym zespołem i systemem sprzedaży wciąż ma bardzo mało graczy. To właśnie ta różnica daje przewagę uczestnikom programu nad konkurencją opartą wyłącznie na osobistej marce trenera.
          </>
        ),
      },
      {
        q: "Co, jeśli moja nisza jest bardzo specyficzna (trening kobiet, seniorów, rehabilitacja, sporty walki) — czy model w ogóle się do tego dopasuje?",
        a: (
          <>
            Wśród naszych uczestników znajdziesz właśnie takie specjalizacje – studia dla kobiet, treningi siłowe dla węższych grup, sporty walki. Model dotyczy struktury biznesu (procesy, zespół, sprzedaż), a nie konkretnej metodyki treningowej, więc dopasowuje się do Twojej niszy, a nie ją zastępuje.
          </>
        ),
      },
      {
        q: "Czy będę musiał konkurować z sieciówkami i franczyzami, które mają dużo większy budżet marketingowy?",
        a: (
          <>
            Program uczy pozycjonowania i sprzedaży opartej na jakości relacji i wynikach klientów, a nie na wielkości budżetu reklamowego – dlatego mniejsze, dobrze poukładane studia regularnie wygrywają lokalnie z sieciówkami, mimo dysproporcji budżetów.
          </>
        ),
      },
      {
        q: "Czy program działa też dla trenerów pracujących głównie online, czy zakłada wyłącznie stacjonarne studio?",
        a: (
          <>
            Model skupia się na budowie stacjonarnego studia treningowego z zespołem i realną lokalizacją – jeśli Twój biznes jest w pełni online, warto to wprost poruszyć na konsultacji, żeby ocenić, czy i jak model da się zaadaptować do Twojej sytuacji.
          </>
        ),
      },
    ],
  },
  {
    id: "requirements-and-skills",
    categoryNumber: "09",
    title: "Czego wymaga się ode mnie",
    subtitle: "Certyfikaty, social media, sprzedaż i zespół.",
    questions: [
      {
        q: "Czy muszę mieć konkretne certyfikaty albo wykształcenie kierunkowe, żeby to ruszyć?",
        a: (
          <>
            Nie – mówimy o systemie budowania i skalowania biznesu, a nie o samym prowadzeniu treningów. Twoje uprawnienia trenerskie czy specjalizacja to Twoja strefa kompetencji; my uczymy Cię, jak zbudować wokół niej rentowną, poukładaną firmę.
          </>
        ),
      },
      {
        q: "Czy potrzebuję dużej rozpoznawalności / followersów w social media, czy mogę być kompletnie anonimowy na starcie?",
        a: (
          <>
            Nie musisz mieć rozpoznawalności ani zasięgów, żeby zacząć – większość uczestników programu startowała bez dużej obecności w mediach społecznościowych. Budowanie marki osobistej może pomóc, ale nie jest warunkiem koniecznym w tym modelu.
          </>
        ),
      },
      {
        q: "Co, jeśli nienawidzę sprzedaży i rozmów handlowych — czy będę musiał to robić sam, czy da się to zdelegować od razu?",
        a: (
          <>
            Jednym z filarów programu jest nauczenie Cię, jak zbudować proces sprzedaży, który nie zależy wyłącznie od Ciebie – docelowo deleguje się go do zespołu. Na starcie zwykle uczestniczysz w tym osobiście, żeby zrozumieć mechanikę, ale celem jest, żebyś przestał być jedynym sprzedawcą w firmie.
          </>
        ),
      },
      {
        q: "Co, jeśli nie mam żadnego zaplecza biznesowego — nie znam się na księgowości, marketingu, zarządzaniu ludźmi?",
        a: (
          <>
            Większość uczestników programu startowała dokładnie z tego punktu – jako trenerzy, nie przedsiębiorcy z wykształceniem biznesowym. Program krok po kroku uczy tych obszarów w praktycznym, wdrożeniowym wymiarze, a nie zakłada, że już to umiesz.
          </>
        ),
      },
      {
        q: "Czy mogę robić to w międzyczasie, pracując jeszcze na etacie, czy muszę rzucić wszystko z dnia na dzień?",
        a: (
          <>
            Wielu uczestników zaczynało, pracując jeszcze na etacie lub prowadząc treningi personalne równolegle – plan wdrożenia jest rozłożony w czasie właśnie po to, żeby dało się to pogodzić, zamiast wymagać natychmiastowej, ryzykownej decyzji o odejściu z pracy.
          </>
        ),
      },
      {
        q: "Czy będę musiał zatrudnić pracowników od razu, czy mogę robić to stopniowo?",
        a: (
          <>
            Rekrutacja zespołu odbywa się stopniowo, w tempie dopasowanym do rosnącej liczby klientów i przychodu – nie zatrudniasz kilku trenerów naraz bez pokrycia w budżecie, tylko rozbudowujesz zespół równolegle z rozwojem studia.
          </>
        ),
      },
      {
        q: "Czy będę zmuszony budować markę osobistą i nagrywać treści, chociaż wolę zostać w cieniu i po prostu zarządzać biznesem?",
        a: (
          <>
            Nie – obecność w mediach społecznościowych pomaga, ale nie jest obowiązkowym elementem programu. Znajdziesz wśród uczestników zarówno osoby aktywnie budujące markę osobistą, jak i takie, które wolą pozostać w cieniu i skupić się wyłącznie na zarządzaniu operacyjnym studia.
          </>
        ),
      },
    ],
  },
  {
    id: "why-different",
    categoryNumber: "10",
    title: "Dlaczego to ma być inne niż wszystko, co już próbowałeś",
    subtitle: "Dla tych, którzy mają za sobą nieudane kursy i konsultantów.",
    questions: [
      {
        q: "Próbowałem już innych konsultantów/kursów bez efektu — czym to się różni i dlaczego akurat to zadziała?",
        a: (
          <>
            Wielu naszych uczestników miało za sobą podobne, nieudane doświadczenia z generycznymi kursami marketingowymi czy konsultantami bez realnego doświadczenia w branży fitness. Różnica polega na tym, że pracujesz z systemem przetestowanym w 50 realnych studiach treningowych, a nie z uniwersalną teorią biznesową przeniesioną z innej branży.
          </>
        ),
      },
      {
        q: "Czy program zmusi mnie do radykalnej zmiany cennika, przez co stracę część obecnych, lojalnych klientów?",
        a: (
          <>
            Zmiany cennika, jeśli w ogóle są potrzebne, wprowadzamy stopniowo i w sposób zaplanowany, a nie poprzez nagłą podwyżkę, która odstraszy dotychczasowych klientów. Celem jest zbudowanie oferty, która utrzymuje lojalnych klientów i jednocześnie poprawia marżę – a nie wymiana jednych na drugich.
          </>
        ),
      },
    ],
  },
];

const MAP_LOCATIONS = [
  {
    name: "Siedziba & Studio Poddębice",
    location: "ul. Partyzantów 42B",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Sportowe+Przedmieście+Partyzantów+42B+Poddębice",
  },
  {
    name: "Studio Łódź (Julianów)",
    location: "ul. Gen. Józefa Bema 25A",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Sportowe+Przedmieście+Gen+Józefa+Bema+25A+Łódź",
  },
  {
    name: "Studio dla Kobiet Łęczyca",
    location: "ul. Kaliska 9a",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Sportowe+Przedmieście+Kaliska+9a+Łęczyca",
  },
];

export function DueDiligenceSection() {
  return (
    <section className="relative w-full bg-white font-sans selection:bg-orange-200 flex flex-col items-center overflow-x-hidden pt-4 pb-16 px-4 sm:px-6">
      <div className="mx-auto flex w-full max-w-[22.5rem] sm:max-w-[25.5rem] flex-col items-center">

        {/* Eyebrow Pill */}
        <div className="inline-flex items-center justify-center rounded-full border-[1.5px] border-neutral-300 bg-neutral-50 px-3.5 py-1 shadow-2xs">
          <span className="text-[0.65rem] font-extrabold uppercase tracking-[0.16em] text-neutral-900">
            KROK 4
          </span>
        </div>

        {/* Section Heading */}
        <h2 className="mt-2.5 text-center text-[1.3rem] min-[390px]:text-[1.45rem] sm:text-[1.65rem] font-extrabold leading-tight tracking-tight text-neutral-900">
          Jesteś Sceptyczny? <br />
          <span className="underline decoration-neutral-900 decoration-2 underline-offset-2">
            Oto Fakty Bez Filtra!
          </span>
        </h2>

        {/* Subheadline */}
        <p className="mt-2 text-center text-[0.78rem] min-[390px]:text-[0.84rem] sm:text-[0.88rem] font-light leading-[1.4] text-neutral-600">
          Sprawdź Dochodowe Studio w Google, przeszukaj Instagram lub zweryfikuj lokalizacje Sportowe Przedmieście.<br />
          Stawiamy na 100% transparentności, zanim dołączysz do szkolenia.
        </p>

        {/* Streamlined Social Links */}
        <div className="mt-5 grid w-full grid-cols-3 gap-2">
          <a
            href="https://www.youtube.com/@bartlomiej.sikorski"
            target="_blank"
            rel="noreferrer"
            className="group flex h-10 items-center justify-center gap-1.5 rounded-xl border border-neutral-200/90 bg-white px-2 shadow-2xs transition-all hover:border-neutral-900 hover:bg-neutral-50 active:scale-[0.97]"
          >
            <svg className="h-4 w-4 shrink-0 text-[#ff0000]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            <span className="text-[0.74rem] sm:text-[0.78rem] font-bold tracking-tight text-neutral-800 transition-colors group-hover:text-neutral-900">
              YouTube
            </span>
          </a>

          <a
            href="https://www.instagram.com/sikorski.bartlomiej"
            target="_blank"
            rel="noreferrer"
            className="group flex h-10 items-center justify-center gap-1.5 rounded-xl border border-neutral-200/90 bg-white px-2 shadow-2xs transition-all hover:border-neutral-900 hover:bg-neutral-50 active:scale-[0.97]"
          >
            <svg className="h-4 w-4 shrink-0 text-[#e1306c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
            </svg>
            <span className="text-[0.74rem] sm:text-[0.78rem] font-bold tracking-tight text-neutral-800 transition-colors group-hover:text-neutral-900">
              Instagram
            </span>
          </a>

          <a
            href="https://www.facebook.com/sikorskibartlomiej1"
            target="_blank"
            rel="noreferrer"
            className="group flex h-10 items-center justify-center gap-1.5 rounded-xl border border-neutral-200/90 bg-white px-2 shadow-2xs transition-all hover:border-neutral-900 hover:bg-neutral-50 active:scale-[0.97]"
          >
            <svg className="h-4 w-4 shrink-0 text-[#1877f2]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span className="text-[0.74rem] sm:text-[0.78rem] font-bold tracking-tight text-neutral-800 transition-colors group-hover:text-neutral-900">
              Facebook
            </span>
          </a>
        </div>

        {/* Fully Expanded, Always-Readable Q&A List — no clicking required */}
        <div className="mt-6 w-full">
          {DUE_DILIGENCE_DATA.map((item, catIdx) => (
            <div
              key={item.id}
              className={`w-full ${catIdx === 0 ? "" : "mt-6 pt-6 border-t border-neutral-200"}`}
            >
              {/* Category Title */}
              <h3 className="text-[0.98rem] sm:text-[1.05rem] font-black tracking-tight text-neutral-900">
                {item.title}
              </h3>
              <p className="mt-0.5 text-[0.74rem] sm:text-[0.76rem] text-neutral-500 leading-snug">
                {item.subtitle}
              </p>

              {/* All Q&A pairs — fully visible, no accordion */}
              <div className="mt-3.5 space-y-4">
                {item.questions.map((faq, idx) => (
                  <div key={idx} className="space-y-1">
                    <p className="text-[0.85rem] sm:text-[0.88rem] font-bold text-neutral-900 leading-snug">
                      {faq.q}
                    </p>
                    <div className="text-[0.8rem] sm:text-[0.85rem] leading-relaxed text-neutral-700">
                      {faq.a}
                    </div>
                  </div>
                ))}
              </div>

              {/* Google Maps Hub Links */}
              {item.id === "legitimacy" && (
                <div className="mt-3.5">
                  <p className="text-[0.72rem] font-bold uppercase tracking-wider text-neutral-500">
                    Zweryfikowane lokalizacje:
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1.5 text-[0.76rem]">
                    {MAP_LOCATIONS.map((loc) => (
                      <a
                        key={loc.name}
                        href={loc.mapUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-neutral-900 underline decoration-neutral-400 underline-offset-2 hover:decoration-neutral-900"
                      >
                        {loc.name} ({loc.location}) →
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
