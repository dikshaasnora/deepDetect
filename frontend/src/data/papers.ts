type CalloutNode = { type: "callout"; label: string; text: string }
type TableNode = {
  type: "table"
  headers: string[]
  rows: (string | number)[][]
  caption?: string
}
type RefsNode = { type: "refs"; items: string[] }
type Node = string | CalloutNode | TableNode | RefsNode

export type Section = {
  id: string
  numeral: string
  title: string
  body: Node[]
}

export type Paper = {
  id: string
  subtitle?: string
  title: string
  authors: { name: string; aff: string }[]
  affiliation: string
  tags: string[]
  sections: Section[]
}

export const paper1: Paper = {
  id: "paper1",
  title: "Deepfake Image Detection — Real or Fake",
  authors: [
    { name: "Krish Lal Srivastava", aff: "1" },
    { name: "Diksha Asnora", aff: "2" },
    { name: "Harshit Mehra", aff: "3" },
    { name: "Shreya Gupta", aff: "4" },
    { name: "Mr. Abhishek Chaudhary", aff: "5" },
  ],
  affiliation:
    "1,2,3,4,5 — Department of Computer Science and Engineering, MGM's College of Engineering and Technology, Noida, Uttar Pradesh, India",
  tags: ["Deepfake Detection", "CNN", "Image Forensics", "Machine Learning", "IJIRT · Feb 2026"],
  sections: [
    {
      id: "p1-abstract",
      numeral: "00",
      title: "Abstract",
      body: [
        "Recent progress in artificial intelligence has enabled the creation of highly convincing synthetic media — particularly deepfake images — which raise serious concerns about the reliability and trustworthiness of digital content. Deepfakes are produced using advanced deep-learning techniques that can accurately imitate facial structures, expressions, and textures, making manual identification extremely challenging.",
        "This research proposes a <strong>convolutional neural network (CNN)-based framework</strong> for reliable deepfake image detection. The approach emphasizes facial-region preprocessing, image normalization, and data augmentation, combined with transfer learning to enhance robustness and generalization across datasets. Experimental evaluation on standard benchmark datasets demonstrates that the proposed framework achieves strong detection performance while remaining computationally efficient — making it suitable for real-time and resource-constrained environments.",
        {
          type: "callout",
          label: "Key Finding",
          text: "The proposed CNN achieves 96.8% accuracy on FaceForensics++ and 95.2% recall — offering a favorable trade-off between accuracy, efficiency, and real-time inference speed.",
        },
      ],
    },
    {
      id: "p1-intro",
      numeral: "01",
      title: "Introduction",
      body: [
        "The widespread use of social media platforms and digital communication tools has led to an unprecedented growth in the creation and distribution of visual content. Alongside these advancements, artificial intelligence has enabled the development of sophisticated image-manipulation techniques capable of generating highly realistic synthetic images — commonly referred to as deepfakes. These manipulated images can convincingly replicate human facial characteristics, often making them indistinguishable from real images to the human eye.",
        "The misuse of deepfake technology has raised significant concerns in misinformation, identity fraud, political manipulation, and digital privacy. Fake images can be exploited to damage reputations, manipulate public opinion, or fabricate evidence — undermining trust in digital media. Ensuring the authenticity of visual content has therefore become a critical challenge for researchers, policymakers, and forensic analysts.",
        "Traditional image-forensic methods rely on handcrafted features and statistical cues to identify manipulations; however, these approaches often fail when confronted with high-quality deepfake images generated using modern neural networks. In contrast, deep-learning-based techniques have demonstrated superior performance by automatically learning discriminative features directly from data. Convolutional neural networks, in particular, have shown strong potential in capturing the subtle visual artifacts introduced during image synthesis.",
        "This research focuses on designing an efficient CNN-based deepfake-image-detection framework that balances detection accuracy with computational efficiency. By emphasizing facial-region analysis and robust preprocessing strategies, the proposed system aims to perform reliably across diverse datasets and real-world conditions.",
      ],
    },
    {
      id: "p1-related",
      numeral: "02",
      title: "Literature Review",
      body: [
        "The rapid evolution of deepfake-generation techniques has motivated extensive research on detection strategies. Early studies in image forgery detection primarily relied on handcrafted features — including texture inconsistencies, lighting irregularities, and compression artifacts. While these methods achieved reasonable performance on simple manipulations, they struggled to generalize to deepfakes generated using advanced neural networks.",
        "With the emergence of deep learning, researchers began exploring CNNs for deepfake detection. Afchar et&nbsp;al. introduced <strong>MesoNet</strong>, a lightweight CNN architecture designed to detect facial manipulation by analyzing mesoscopic features. Although MesoNet demonstrated promising results, its performance was limited when tested on large-scale and diverse datasets.",
        "Subsequent work by Rössler et&nbsp;al. led to the development of the <strong>FaceForensics++</strong> dataset, which provided a comprehensive benchmark for evaluating deepfake-detection methods. Using this dataset, deeper architectures such as XceptionNet achieved high detection accuracy by learning complex spatial features. However, these models often require substantial computational resources, making them less suitable for real-time applications.",
        "Other researchers explored alternative approaches to improve generalization and robustness — frequency-domain analysis, capsule networks, and attention mechanisms have been proposed to capture subtle manipulation traces. Additionally, transfer learning has been widely adopted to leverage pre-trained models and improve performance on limited datasets.",
        "Despite these advancements, challenges such as cross-dataset generalization, robustness to compression, and computational efficiency remain unresolved. This study builds upon existing research by proposing a compact and efficient CNN-based framework that aims to address these limitations while maintaining strong detection performance.",
      ],
    },
    {
      id: "p1-problem",
      numeral: "03",
      title: "Problem Statement",
      body: [
        "Despite significant progress in deepfake-image detection, several critical challenges continue to limit the effectiveness of existing solutions in real-world environments. As deepfake-generation techniques evolve rapidly, detection systems must adapt to increasingly sophisticated manipulations while maintaining reliability and efficiency.",
        "<strong>Cross-dataset generalization</strong> is one major challenge. Many deepfake detectors are trained and evaluated on specific datasets and exhibit strong performance only under similar data conditions. When tested on unseen datasets or new manipulation techniques, accuracy often degrades due to variations in image quality, encoding methods, and generative architectures.",
        "<strong>Robustness to post-processing</strong> is another important issue. In practical scenarios, images shared across digital platforms are commonly subjected to compression, resizing, noise addition, and filtering. Such transformations can obscure forensic artifacts, causing many detection models to fail or produce unreliable predictions.",
        "<strong>Explainability and interpretability</strong> also remain key concerns. Deep-learning models, particularly CNNs, often function as black boxes, providing predictions without clear justification. For digital forensics, law enforcement, and content moderation, it is essential that detection systems offer interpretable outputs that help users understand the basis of classification decisions.",
        "The objective of this research is to address these challenges by developing an efficient CNN-based deepfake-image-detection framework that emphasizes generalization, robustness, interpretability, and computational feasibility for practical deployment.",
      ],
    },
    {
      id: "p1-method",
      numeral: "04",
      title: "Methodology",
      body: [
        "The proposed deepfake-image-detection framework follows a structured and modular methodology that includes data acquisition, preprocessing, model design, training, and evaluation.",
        "<strong>Data Acquisition and Preprocessing.</strong> The datasets used include widely recognized deepfake benchmarks — FaceForensics++, Celeb-DF, and the DeepFake Detection Challenge (DFDC). Initially, facial regions are extracted from input images using a face-detection and alignment process to ensure consistency in input dimensions. Each detected face is resized to a fixed resolution of 224 × 224 pixels. Pixel values are normalized to improve numerical stability during training. Data-augmentation techniques such as random rotation, horizontal flipping, brightness variation, Gaussian blur, and JPEG compression are applied.",
        "<strong>CNN Model Architecture.</strong> The core of the proposed system is a CNN designed to balance detection accuracy and computational efficiency. The network consists of multiple convolutional layers for feature extraction, followed by pooling layers to reduce spatial dimensionality. Fully connected layers are used for classification, while regularization techniques such as dropout and batch normalization are incorporated to improve generalization.",
        {
          type: "table",
          caption: "Table II — Configuration of the proposed CNN model",
          headers: ["Layer Type", "Parameters", "Output Size"],
          rows: [
            ["Input Layer", "224 × 224 × 3", "224 × 224 × 3"],
            ["Conv2D + ReLU", "32 filters, 3×3", "222 × 222 × 32"],
            ["Max Pooling", "2×2", "111 × 111 × 32"],
            ["Conv2D + ReLU", "64 filters, 3×3", "109 × 109 × 64"],
            ["Fully Connected", "128 neurons", "128"],
            ["**Output Layer**", "**Sigmoid**", "**1**"],
          ],
        },
        "<strong>Training Strategy.</strong> The model is trained using binary cross-entropy loss to differentiate between real and fake images. The Adam optimizer is employed with a low learning rate to ensure stable convergence. Transfer learning is utilized by initializing convolutional layers with pretrained weights. The dataset is divided into training, validation, and testing subsets in a 70:15:15 ratio. Early stopping is applied based on validation loss to prevent overfitting.",
        "<strong>Evaluation Metrics.</strong> Model performance is evaluated using accuracy, precision, recall, F1-score, and area under the ROC curve (AUC). Cross-dataset testing is performed to assess the generalization capability of the proposed framework.",
      ],
    },
    {
      id: "p1-design",
      numeral: "05",
      title: "System Design",
      body: [
        "The deepfake-image-detection system is designed as a modular and scalable framework that supports efficient processing, classification, and result visualization. The architecture enables seamless data flow from image input to final prediction, while allowing individual components to be upgraded independently.",
        "The framework consists of five interconnected modules — Input, Preprocessing, CNN Classification, Decision &amp; Confidence, and Visualization &amp; Reporting — each responsible for a discrete stage of the forensic pipeline.",
        {
          type: "table",
          caption: "Table I — Datasets used for deepfake image detection",
          headers: ["Dataset", "Type", "Samples", "Purpose"],
          rows: [
            ["FaceForensics++", "Real & Fake faces", "100,000+", "Training & validation"],
            ["DFDC", "Deepfake images", "120,000+", "Robustness testing"],
            ["**Celeb-DF**", "Celebrity faces", "50,000+", "**Generalization eval**"],
          ],
        },
      ],
    },
    {
      id: "p1-results",
      numeral: "06",
      title: "Results & Discussion",
      body: [
        "This section presents the performance evaluation of the proposed CNN-based deepfake-image-detection framework. Results are analyzed using standard classification metrics to assess detection accuracy, robustness, and computational efficiency.",
        "<strong>Quantitative Performance Analysis.</strong> The proposed framework was evaluated on multiple benchmark datasets including FaceForensics++, Celeb-DF, and DFDC. The proposed CNN achieves accuracy exceeding 90% on FaceForensics++ and Celeb-DF, indicating strong detection capability. The slight performance drop observed on DFDC reflects the increased diversity and complexity of real-world deepfake samples, yet results remain competitive.",
        {
          type: "table",
          caption: "Table III — Performance comparison of detection models",
          headers: ["Model", "Accuracy (%)", "Precision (%)", "Recall (%)"],
          rows: [
            ["MesoNet", "92.4", "91.8", "90.9"],
            ["XceptionNet", "94.6", "94.1", "93.7"],
            ["**Proposed CNN**", "**96.8**", "**96.2**", "**95.9**"],
          ],
        },
        "<strong>Qualitative Evaluation.</strong> Visual interpretability was analyzed using Grad-CAM to identify regions contributing to the classification decision. The model focuses on discriminative facial regions such as the eyes, mouth, and boundary areas, where synthesis artifacts are commonly present.",
        {
          type: "callout",
          label: "Key Insight",
          text: "Although heavier architectures such as XceptionNet achieve marginally higher accuracy, they require significantly more compute. The proposed CNN trades a fraction of a percentage point for inference speed — making it viable for real-time and edge deployment.",
        },
      ],
    },
    {
      id: "p1-conclusion",
      numeral: "07",
      title: "Conclusion",
      body: [
        "The increasing realism of deepfake images poses a serious threat to the credibility of digital media and highlights the urgent need for reliable detection mechanisms. This research presented an efficient CNN-based framework for deepfake image detection that balances accuracy, robustness, and computational efficiency. By focusing on facial-region analysis, normalization, and augmentation strategies, the proposed system is capable of identifying subtle artifacts introduced during image synthesis.",
        "Experimental evaluation on standard benchmark datasets demonstrated that the proposed framework achieves high detection accuracy while maintaining strong generalization across different datasets. Comparative analysis showed that, although heavier deep-learning models may yield slightly higher accuracy, the proposed CNN provides a favorable trade-off between performance and inference speed — making it suitable for real-time and edge-based deployment.",
        "<strong>Future Scope</strong> — extension to video-based deepfake detection, incorporating multimodal data including audio and text cues, exploring transformer-based architectures, improving robustness against adversarial attacks, and expanding training datasets to include diverse demographic and environmental conditions.",
      ],
    },
    {
      id: "p1-refs",
      numeral: "08",
      title: "References",
      body: [
        {
          type: "refs",
          items: [
            "D. Afchar, V. Nozick, J. Yamagishi, I. Echizen — <em>MesoNet: A compact facial video forgery detection network.</em> Proc. IEEE WIFS, pp. 1–7, 2018.",
            "A. Rössler, D. Cozzolino, L. Verdoliva, C. Riess, J. Thies, M. Nießner — <em>FaceForensics++: Learning to detect manipulated facial images.</em> ICCV, 2019.",
            "F. Chollet — <em>Xception: Deep learning with depthwise separable convolutions.</em> CVPR, pp. 1251–1258, 2017.",
            "H.&nbsp;H. Nguyen, J. Yamagishi, I. Echizen — <em>Capsule-forensics: Using capsule networks to detect forged images and videos.</em> IEEE T-IFS, vol. 16, pp. 3412–3427, 2021.",
            "Y. Li, S. Lyu — <em>Exposing deepfake videos by detecting face-warping artifacts.</em> CVPRW, pp. 46–52, 2019.",
            "L. Li, J. Bao, H. Yang, D. Chen, F. Wen — <em>Face X-Ray for more general face-forgery detection.</em> CVPR, pp. 5001–5010, 2020.",
            "B. Dolhansky et al. — <em>The DeepFake Detection Challenge (DFDC) dataset.</em> arXiv:2006.07397, 2020.",
            "R. Tolosana et al. — <em>Deepfakes and beyond: A survey of face manipulation and fake detection.</em> Inf. Fusion, vol. 64, pp. 131–148, 2020.",
            "J. Li, T. Sun, Y. Yang, S. Wang — <em>Frequency-domain learning for deepfake image detection.</em> IEEE Access, vol. 9, pp. 121,318–121,329, 2021.",
            "A. Rawat, R. Singh, M. Vatsa — <em>Cross-dataset generalization in deepfake detection.</em> IEEE Access, vol. 10, pp. 98,829–98,842, 2022.",
          ],
        },
      ],
    },
  ],
}

export const paper2: Paper = {
  id: "paper2",
  subtitle: "Continuation Study",
  title:
    "Hybrid CNN-Transformer with Multimodal Fusion for Deepfake Detection",
  authors: [
    { name: "Krish Lal Srivastava", aff: "1" },
    { name: "Diksha Asnora", aff: "2" },
    { name: "Harshit Mehra", aff: "3" },
    { name: "Shreya Gupta", aff: "4" },
  ],
  affiliation:
    "1,2,3,4 — Department of Computer Science and Engineering, MGM's College of Engineering and Technology, Noida, Uttar Pradesh, India · Guide: Mr. Abhishek Chaudhary",
  tags: ["CNN-Transformer", "Multimodal Fusion", "Explainable AI", "Adversarial Robustness"],
  sections: [
    {
      id: "p2-abstract",
      numeral: "00",
      title: "Abstract",
      body: [
        "The rapid advancement of generative artificial intelligence has intensified the challenge of distinguishing authentic media from synthetic deepfakes. Building upon prior CNN-based frameworks, this continuation research explores advanced detection strategies that address real-world deployment issues such as adversarial robustness, multimodal manipulation, and interpretability. A <strong>hybrid architecture integrating convolutional neural networks with transformer-based attention</strong> is proposed, alongside multimodal fusion of image, audio, and metadata features.",
        "Experimental evaluation across benchmark datasets demonstrates improved generalization, resilience against compression, and enhanced transparency through explainable-AI techniques. The findings highlight that scalable, interpretable, and fairness-aware detection systems are essential for practical applications in journalism, law enforcement, and social-media moderation.",
        {
          type: "callout",
          label: "Key Result",
          text: "The proposed hybrid CNN-Transformer achieves 97.2% accuracy on FaceForensics++ at 28&nbsp;ms inference — outperforming MesoNet, XceptionNet, and Capsule Networks on both accuracy and speed.",
        },
      ],
    },
    {
      id: "p2-intro",
      numeral: "01",
      title: "Introduction",
      body: [
        "The continuous evolution of artificial intelligence has transformed the landscape of digital media, enabling the creation of synthetic content that is increasingly difficult to distinguish from authentic sources. Deepfake technology — powered by advanced generative models such as GANs and diffusion networks — has progressed beyond simple face swaps to highly realistic manipulations that integrate audio, video, and textual elements.",
        "While the first phase of research primarily focused on CNNs for image-based detection, the growing sophistication of deepfakes necessitates more advanced and adaptable approaches. This second study builds upon earlier CNN-based frameworks by addressing challenges encountered in real-world deployment, including adversarial robustness, multimodal manipulation, and interpretability.",
        "The misuse of deepfakes continues to pose risks in domains such as misinformation, identity theft, political propaganda, and digital forensics. Consequently, the development of scalable, transparent, and fairness-aware detection systems has become a critical priority. By exploring hybrid architectures that combine CNNs with transformer-based attention mechanisms, and by incorporating multimodal fusion strategies, this research aims to extend the capabilities of deepfake detection beyond controlled datasets.",
      ],
    },
    {
      id: "p2-related",
      numeral: "02",
      title: "Literature Review",
      body: [
        "The detection of deepfake content has become one of the most critical research areas in artificial intelligence and digital forensics. Early approaches primarily relied on handcrafted features such as texture inconsistencies, lighting variations, and compression artifacts.",
        "With the rise of deep learning, CNNs emerged as a dominant technique. MesoNet analyzed mesoscopic features but struggled with large-scale datasets and high-resolution synthetic images. FaceForensics++ became a benchmark; XceptionNet achieved high accuracy by learning complex spatial features, though at the cost of significant computational resources.",
        "Beyond CNNs, researchers explored alternative strategies. Capsule networks captured spatial hierarchies. Frequency-domain analysis revealed subtle GAN-related artifacts invisible in the spatial domain. Transformer-based architectures introduced multi-head attention, enabling models to capture long-range dependencies and outperform CNNs in high-resolution scenarios. Multimodal approaches combining visual, audio, and textual cues showed promise in detecting manipulations across diverse media formats.",
        "Explainability has become a major focus. Grad-CAM and SHAP provide visual explanations of model decisions, enhancing transparency and trust in forensic applications. However, challenges remain in cross-dataset generalization, resilience against adversarial attacks, and fairness across demographic groups.",
      ],
    },
    {
      id: "p2-problem",
      numeral: "03",
      title: "Problem Statement",
      body: [
        "Despite significant progress in deepfake detection research, several unresolved challenges continue to hinder the effectiveness of existing solutions in real-world environments. As generative models evolve from traditional GANs to diffusion-based architectures and multimodal synthesis, detection systems must adapt to increasingly sophisticated manipulations.",
        {
          type: "table",
          caption: "Table I — Comparative overview of detection challenges and proposed solutions",
          headers: ["Challenge", "Description", "Existing Limitation", "Proposed Solution"],
          rows: [
            [
              "Cross-dataset generalization",
              "Models fail on unseen datasets",
              "Accuracy drops outside training domain",
              "Hybrid CNN-Transformer with transfer learning",
            ],
            [
              "Compression robustness",
              "Social media compresses images",
              "CNN detectors lose reliability",
              "Augmentation with simulated compression",
            ],
            [
              "Adversarial attacks",
              "Pixel-level perturbations deceive detectors",
              "Vulnerable to small changes",
              "Adversarial training & robust augmentation",
            ],
            [
              "Multimodal manipulation",
              "Deepfakes integrate audio, video, text",
              "Image-only models cannot detect cross-modal cues",
              "Fusion of visual + audio + metadata",
            ],
            [
              "Interpretability",
              "Black-box predictions",
              "No justification for verdicts",
              "Grad-CAM + SHAP visual explanations",
            ],
            [
              "**Fairness & bias**",
              "Dataset imbalance reduces reliability across demographics",
              "Biased predictions for under-represented groups",
              "**Fairness-aware training, balanced datasets**",
            ],
          ],
        },
      ],
    },
    {
      id: "p2-method",
      numeral: "04",
      title: "Methodology",
      body: [
        "The methodology adopted in this continuation research builds upon the CNN-based framework introduced in the first study, while extending it with hybrid architectures and multimodal strategies to address real-world challenges. The process is structured into sequential stages: data acquisition, preprocessing, model design, training, and evaluation.",
        "<strong>A · Data Acquisition and Preprocessing.</strong> Benchmark datasets such as FaceForensics++, Celeb-DF, DFDC, and FakeAVCeleb were utilized to ensure diversity in manipulations and modalities. Facial regions were extracted via automated detection and alignment, resized to 224 × 224, and normalized for numerical stability. To simulate real-world conditions, preprocessing included compression artifacts, noise injection, and multimodal alignment of audio and metadata.",
        "<strong>B · Hybrid Model Architecture.</strong> The proposed system integrates CNNs for local feature extraction with transformer-based attention for capturing long-range dependencies. CNN layers focus on texture and pixel-level artifacts, while transformer layers analyze global relationships across facial regions. For multimodal fusion, audio spectrograms and textual metadata are processed alongside visual features.",
        "<strong>C · Training Strategy.</strong> The model was trained using binary cross-entropy loss with the Adam optimizer and a low learning rate. CNN layers were initialized with pretrained ImageNet weights; transformer layers were fine-tuned on deepfake datasets. Adversarial training was incorporated to strengthen resilience against perturbations.",
        "<strong>D · Evaluation Metrics.</strong> Performance was assessed using accuracy, precision, recall, F1-score, and AUC. Cross-dataset testing evaluated generalization, while adversarial robustness was measured by introducing controlled perturbations. Interpretability was analyzed using Grad-CAM and SHAP visualizations.",
      ],
    },
    {
      id: "p2-design",
      numeral: "05",
      title: "System Design",
      body: [
        "The system design extends the modular architecture introduced in the first study to support multimodal inputs, transformer-based processing, and explainability outputs. The pipeline begins with image acquisition and ends with classification output, with the architecture optimized for real-time inference and interpretability.",
        {
          type: "callout",
          label: "Architecture Summary",
          text: "CNN (local features) + Transformer attention (global dependencies) + Multimodal fusion (audio, metadata) → Decision fusion → Explainability layer (Grad-CAM + SHAP) → Binary verdict with confidence score.",
        },
      ],
    },
    {
      id: "p2-results",
      numeral: "06",
      title: "Results & Discussion",
      body: [
        "This section presents the evaluation of the proposed hybrid CNN-Transformer-based deepfake-detection framework. Results are analyzed using standard classification metrics and compared with existing models to highlight improvements in accuracy, robustness, and interpretability.",
        "<strong>A · Quantitative Performance.</strong> The framework was tested on benchmark datasets including FaceForensics++, Celeb-DF, DFDC, and FakeAVCeleb.",
        {
          type: "table",
          caption: "Table II — Performance of proposed hybrid model across datasets",
          headers: ["Dataset", "Accuracy (%)", "Precision (%)", "Recall (%)", "F1 (%)"],
          rows: [
            ["FaceForensics++", "97.2", "96.8", "96.4", "96.6"],
            ["Celeb-DF", "96.5", "95.9", "95.2", "95.5"],
            ["DFDC", "93.8", "92.7", "92.1", "92.4"],
            ["**FakeAVCeleb (Multimodal)**", "**94.6**", "**93.9**", "**93.2**", "**93.5**"],
          ],
        },
        "<strong>B · Comparative Analysis.</strong> To evaluate efficiency, the proposed framework was compared with MesoNet, XceptionNet, and Capsule Networks.",
        {
          type: "table",
          caption: "Table III — Comparative performance of detection models",
          headers: ["Model", "Accuracy (%)", "Latency (ms)", "Interpretability"],
          rows: [
            ["MesoNet", "92.4", "15", "Limited"],
            ["XceptionNet", "94.6", "45", "Moderate"],
            ["Capsule Networks", "93.1", "60", "Limited"],
            ["**Proposed Hybrid**", "**97.2**", "**28**", "**High (Grad-CAM, SHAP)**"],
          ],
        },
        "<strong>C · Qualitative Evaluation.</strong> Grad-CAM and SHAP visualizations highlighted manipulated facial regions such as eyes, mouth, and boundary areas — improving transparency and supporting forensic investigations.",
        "<strong>D · Discussion.</strong> The hybrid architecture improves generalization across datasets, adversarial training enhances robustness, and multimodal fusion enables detection of complex manipulations. Interpretability techniques further strengthen user trust, making the system suitable for journalism, law enforcement, and social-media moderation.",
      ],
    },
    {
      id: "p2-conclusion",
      numeral: "07",
      title: "Conclusion",
      body: [
        "This continuation study reinforces the urgent need for advanced deepfake-detection systems capable of addressing real-world challenges. Building upon the CNN-based framework introduced earlier, the proposed hybrid CNN-Transformer framework demonstrates superior accuracy, robustness, and interpretability. By integrating multimodal fusion and adversarial defense strategies, the system effectively detects manipulations across diverse datasets and compressed social-media content.",
        "The inclusion of explainable-AI techniques further enhances transparency, allowing forensic analysts and media platforms to understand the basis of classification decisions. Compared to traditional models, the proposed framework achieves a balanced trade-off between detection performance and computational efficiency.",
        "<strong>Future Scope</strong> — video-based detection of temporal inconsistencies; multimodal expansion (audio + metadata); transformer and diffusion architectures; stronger adversarial defenses; fairness and bias mitigation; edge and real-time deployment; blockchain-anchored verification; and continued advances in explainable-AI techniques.",
      ],
    },
    {
      id: "p2-refs",
      numeral: "08",
      title: "References",
      body: [
        {
          type: "refs",
          items: [
            "D. Afchar, V. Nozick, J. Yamagishi, I. Echizen — <em>MesoNet.</em> IEEE WIFS, 2018.",
            "A. Rössler et al. — <em>FaceForensics++.</em> ICCV, 2019.",
            "S. Wang, Y. Li, S. Lyu — <em>Transformer-based deepfake detection.</em> CVPR, 2022.",
            "H. Li, M. Chang, X. Ma — <em>Frequency-domain analysis for robust deepfake detection.</em> IEEE T-IP, vol. 32, pp. 1124–1136, 2023.",
            "S. Agarwal et al. — <em>Detecting deepfakes from phoneme-viseme mismatches.</em> CVPRW, 2021.",
            "R.&nbsp;R. Selvaraju et al. — <em>Grad-CAM: Visual explanations from deep networks via gradient-based localization.</em> IJCV, 128(2), pp. 336–359, 2020.",
            "S.&nbsp;M. Lundberg, S.&nbsp;I. Lee — <em>A unified approach to interpreting model predictions.</em> NeurIPS, 2017.",
            "B. Dolhansky et al. — <em>DFDC dataset.</em> arXiv:2006.07397, 2020.",
            "H. Khalid, S. Woo, S. Lee — <em>FakeAVCeleb.</em> ACM Multimedia, 2022.",
          ],
        },
      ],
    },
  ],
}
