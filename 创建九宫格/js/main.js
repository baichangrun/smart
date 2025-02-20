class ImageSplitter {
    constructor() {
        this.initElements();
        this.bindEvents();
        this.maxFileSize = 5 * 1024 * 1024; // 5MB
    }

    initElements() {
        this.dropZone = document.getElementById('dropZone');
        this.fileInput = document.getElementById('fileInput');
        this.originalImage = document.getElementById('originalImage');
        this.gridContainer = document.getElementById('gridContainer');
        this.previewSection = document.querySelector('.preview-section');
        this.downloadAllBtn = document.getElementById('downloadAll');
    }

    bindEvents() {
        this.dropZone.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.dropZone.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.dropZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.dropZone.addEventListener('drop', (e) => this.handleDrop(e));
        this.downloadAllBtn.addEventListener('click', () => this.downloadAllImages());
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        this.processFile(file);
    }

    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        this.dropZone.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        this.dropZone.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        this.dropZone.classList.remove('dragover');
        
        const file = e.dataTransfer.files[0];
        this.processFile(file);
    }

    processFile(file) {
        if (!file) return;

        if (!file.type.match('image.*')) {
            alert('请上传图片文件！');
            return;
        }

        if (file.size > this.maxFileSize) {
            alert('文件大小不能超过5MB！');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.originalImage.src = e.target.result;
                this.previewSection.style.display = 'block';
                this.updateImageInfo(img);
                this.splitImage(img);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    updateImageInfo(img) {
        const info = document.querySelector('.image-info');
        info.textContent = `${img.naturalWidth} × ${img.naturalHeight}px`;
    }

    splitImage(img) {
        this.gridContainer.innerHTML = '';
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const partWidth = img.naturalWidth / 3;
        const partHeight = img.naturalHeight / 3;

        for (let i = 0; i < 9; i++) {
            const x = (i % 3) * partWidth;
            const y = Math.floor(i / 3) * partHeight;

            canvas.width = partWidth;
            canvas.height = partHeight;
            ctx.drawImage(img, x, y, partWidth, partHeight, 0, 0, partWidth, partHeight);

            const gridItem = document.createElement('div');
            gridItem.className = 'grid-item';
            
            const partImg = document.createElement('img');
            partImg.src = canvas.toDataURL('image/png');
            
            const downloadBtn = document.createElement('button');
            downloadBtn.className = 'download-btn';
            downloadBtn.textContent = '下载';
            downloadBtn.onclick = () => this.downloadImage(partImg.src, `part_${i + 1}.png`);

            gridItem.appendChild(partImg);
            gridItem.appendChild(downloadBtn);
            this.gridContainer.appendChild(gridItem);
        }
    }

    downloadImage(dataUrl, fileName) {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    async downloadAllImages() {
        const images = Array.from(this.gridContainer.getElementsByTagName('img'));
        const zip = new JSZip();

        images.forEach((img, index) => {
            const fileName = `part_${index + 1}.png`;
            zip.file(fileName, this.dataURLtoBlob(img.src), {base64: true});
        });

        const content = await zip.generateAsync({type: 'blob'});
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = 'split_images.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    dataURLtoBlob(dataurl) {
        const arr = dataurl.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while(n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type: mime});
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new ImageSplitter();
}); 