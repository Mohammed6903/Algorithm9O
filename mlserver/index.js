class MediaProcessingClient {
    constructor(baseUrl = 'http://localhost:8000') {
        this.baseUrl = baseUrl;
    }

    // Upload a video file and start processing
    async uploadVideo(file) {
        // if (!file || !file.type.includes('video/mp4')) {
        //     throw new Error('Please provide a valid MP4 file');
        // }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${this.baseUrl}/generate-analysis`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
            }

            const data = await response.json();
            return data; // Contains taskId and initial status
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    }

    // Check the processing status of a task
    async checkStatus(taskId) {
        try {
            const response = await fetch(`${this.baseUrl}/status/${taskId}`);
            
            if (!response.ok) {
                throw new Error(`Status check failed: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Status check error:', error);
            throw error;
        }
    }

    // Get the complete results of a processed video
    async getResults(taskId) {
        try {
            const response = await fetch(`${this.baseUrl}/result/${taskId}`);
            
            if (!response.ok) {
                throw new Error(`Failed to get results: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Results retrieval error:', error);
            throw error;
        }
    }

    // Get the analysis JSON
    async getAnalysis(taskId) {
        try {
            const response = await fetch(`${this.baseUrl}/analysis/${taskId}`);
            
            if (!response.ok) {
                throw new Error(`Failed to get analysis: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Analysis retrieval error:', error);
            throw error;
        }
    }

    // Get a specific keyframe image
    async getKeyframe(taskId, frameNumber) {
        try {
            const response = await fetch(`${this.baseUrl}/keyframe/${taskId}/${frameNumber}`);
            
            if (!response.ok) {
                throw new Error(`Failed to get keyframe: ${response.statusText}`);
            }

            return response.blob();
        } catch (error) {
            console.error('Keyframe retrieval error:', error);
            throw error;
        }
    }

    // Get the transcript
    async getTranscript(taskId) {
        try {
            const response = await fetch(`${this.baseUrl}/transcript/${taskId}`);
            
            if (!response.ok) {
                throw new Error(`Failed to get transcript: ${response.statusText}`);
            }

            return await response.text();
        } catch (error) {
            console.error('Transcript retrieval error:', error);
            throw error;
        }
    }

    // Poll for status until processing is complete
    async waitForProcessing(taskId, onStatusUpdate = null, pollInterval = 2000) {
        while (true) {
            const status = await this.checkStatus(taskId);
            
            if (onStatusUpdate) {
                onStatusUpdate(status);
            }

            if (status.status === 'completed') {
                return status;
            }
            
            if (status.status === 'failed') {
                throw new Error(`Processing failed: ${status.message}`);
            }

            await new Promise(resolve => setTimeout(resolve, pollInterval));
        }
    }
}

// Usage examples
async function processVideoExample() {
    const client = new MediaProcessingClient();

    try {
        // 1. Upload video and get task ID
        const fileInput = document.querySelector('input[type="file"]');
        const file = fileInput.files[0];
        
        console.log('Uploading video...');
        const uploadResult = await client.uploadVideo(file);
        const taskId = uploadResult.task_id;

        // 2. Wait for processing to complete with status updates
        console.log('Processing video...');
        await client.waitForProcessing(taskId, (status) => {
            console.log(`Processing status: ${status.message}`);
        });

        // 3. Get results
        console.log('Getting results...');
        const results = await client.getResults(taskId);

        // 4. Get analysis
        console.log('Getting analysis...');
        const analysis = await client.getAnalysis(taskId);
        console.log('Analysis:', analysis);

        // 5. Get transcript
        console.log('Getting transcript...');
        const transcript = await client.getTranscript(taskId);
        console.log('Transcript:', transcript);

        // 6. Get first keyframe
        console.log('Getting keyframe...');
        const keyframeBlob = await client.getKeyframe(taskId, 0);
        const keyframeUrl = URL.createObjectURL(keyframeBlob);
        
        // Display keyframe in an image element
        const img = document.createElement('img');
        img.src = keyframeUrl;
        document.body.appendChild(img);

    } catch (error) {
        console.error('Error processing video:', error);
    }
}