const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: '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' });

async function askgroq(itemName) {
  let prompt = `Analyze the given object, which is ${itemName}, and determine its reuse and recycle potential, specifying the type of waste it falls under (e.g., electronic, plastic, metal, organic, hazardous). Estimate the approximate cost savings and environmental benefits (e.g., CO₂ emissions reduced, water saved, resources conserved) if the object is reused or recycled. Additionally, list potential items that the object can be recycled into. Provide images of these items if available.

Please provide the output in JSON format with the following structure:

   {
  "object_name": "Object Name",
    "recycled_into": [
    {
      "item_name": "Item 1",
      "image_url": "URL of image for Item 1"
    },
    {
      "item_name": "Item 2",
      "image_url": "URL of image for Item 2"
    },
    {
      "item_name": "Item 3",
      "image_url": "URL of image for Item 3"
    }
  ]
}

  `;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3-70b-8192",
      temperature: 0,
      max_tokens: 8192,
      top_p: 1,
      stream: true,
      stop: null,
    });

    let response = "";

    for await (const chunk of chatCompletion) {
      response += chunk.choices[0]?.delta?.content || "";
    }

    // Use regex to extract JSON portion
    const jsonMatch = response.match(/{[\s\S]*}/);
    if (jsonMatch) {
      const jsonResponse = JSON.parse(jsonMatch[0]); // Parse the extracted JSON string
      return jsonResponse;
    } else {
      throw new Error("No valid JSON found in response");
    }

  } catch (error) {
    console.error('Error:', error);
    return { error: "Error processing response" };
  }
}

module.exports = askgroq;