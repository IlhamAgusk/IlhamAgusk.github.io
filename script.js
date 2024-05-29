let currentAudio = null;

fetch('https://equran.id/api/v2/surat')
    .then(response => response.json())
    .then(data => {
        const surahList = document.getElementById('surah-list');
        data.data.forEach(surah => {
            const surahItem = document.createElement('div');
            surahItem.classList.add('surah-item');
            surahItem.innerHTML = `
                <h3>${surah.nomor}. ${surah.namaLatin}</h3>
                <p>${surah.arti}</p>
            `;
            surahItem.addEventListener('click', () => {
                showSurahDetail(surah.nomor);
            });
            surahList.appendChild(surahItem);
        });
    })
    .catch(error => {
        console.error('Error fetching Surah list:', error);
    });

function showSurahDetail(nomor) {
    fetch(`https://equran.id/api/v2/surat/${nomor}`)
        .then(response => response.json())
        .then(data => {
            const surahDetail = document.getElementById('surah-detail');
            const surah = data.data;
            surahDetail.innerHTML = `
                <h2>${surah.namaLatin} (${surah.nama})</h2>
                <p>Arti: ${surah.arti}</p>
                <p>Jumlah Ayat: ${surah.jumlahAyat}</p>
                <p>Tempat Turun: ${surah.tempatTurun}</p>
                <div class="tafsir" id="tafsir">
                    <h3>Deskripsi:</h3>
                    <p>${surah.deskripsi}</p>
                </div>
                <div class="audio">
                    <h3>Audio:</h3>
                    <select id="audio-select">
                        <option value="${surah.audioFull['01']}">Syekh Abdullah Al Juhanny</option>
                        <option value="${surah.audioFull['02']}">Abdul Muhsin Al Qasim</option>
                        <option value="${surah.audioFull['03']}">Abdurrahman as Sudais</option>
                        <option value="${surah.audioFull['04']}">Ibrahim Al Dossari</option>
                        <option value="${surah.audioFull['05']}">Misyari Rasyid Al Afasi</option>
                    </select>
                    <button class="play-button" data-audio="${surah.audioFull['01']}">▶</button>
                </div>
                <h3>Ayat:</h3>
                ${surah.ayat.map(ayat => `
                    <p><strong>Ayat ${ayat.nomorAyat}:</strong> ${ayat.teksArab} (${ayat.teksLatin}) - ${ayat.teksIndonesia}</p>
                    <div class="audio-container">
                        <select class="audio-select" data-ayat="${ayat.nomorAyat}">
                            <option value="${ayat.audio['01']}">Syekh Abdullah Al Juhanny</option>
                            <option value="${ayat.audio['02']}">Abdul Muhsin Al Qasim</option>
                            <option value="${ayat.audio['03']}">Abdurrahman as Sudais</option>
                            <option value="${ayat.audio['04']}">Ibrahim Al Dossari</option>
                            <option value="${ayat.audio['05']}">Misyari Rasyid Al Afasi</option>
                        </select>
                        <button class="play-button" data-audio="${ayat.audio['01']}">▶</button>
                    </div>
                `).join('')}
            `;

            fetch(`https://equran.id/api/v2/tafsir/${nomor}`)
                .then(response => response.json())
                .then(tafsirData => {
                    const tafsirDetail = document.getElementById('tafsir');
                    const tafsir = tafsirData.data.tafsir;
                    tafsirDetail.innerHTML += `
                        <h3>Tafsir:</h3>
                        ${tafsir.map(ayat => `
                            <p><strong>Ayat ${ayat.ayat}:</strong> ${ayat.teks}</p>
                        `).join('')}
                    `;
                })
                .catch(error => {
                    console.error('Error fetching Tafsir:', error);
                });

            const audioSelect = document.getElementById('audio-select');
            const playButtons = document.querySelectorAll('.play-button');
            const ayatAudioSelects = document.querySelectorAll('.audio-select');

            audioSelect.addEventListener('change', () => {
                const selectedAudio = audioSelect.value;
                document.querySelector('.audio .play-button').dataset.audio = selectedAudio;
            });

            ayatAudioSelects.forEach(select => {
                select.addEventListener('change', () => {
                    const selectedAudio = select.value;
                    const ayatNumber = select.dataset.ayat;
                    document.querySelector(`.audio-container select[data-ayat="${ayatNumber}"] + .play-button`).dataset.audio = selectedAudio;
                });
            });

            playButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const selectedAudio = button.dataset.audio;
                    if (currentAudio && currentAudio.src === selectedAudio) {
                        if (currentAudio.paused) {
                            currentAudio.play();
                            button.textContent = '⏸️';
                        } else {
                            currentAudio.pause();
                            button.textContent = '▶️';
                        }
                    } else {
                        if (currentAudio) {
                            currentAudio.pause();
                            document.querySelector('.audio .play-button').textContent = '▶️';
                        }
                        currentAudio = new Audio(selectedAudio);
                        currentAudio.play();
                        button.textContent = '⏸️';
                    }
                });
            });
        })
        .catch(error => {
            console.error('Error fetching Surah detail:', error);
        });
}

function playAudio(src) {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }
    currentAudio = new Audio(src);
    currentAudio.play();
}