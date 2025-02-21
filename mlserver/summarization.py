from langchain_ollama import OllamaLLM
# from langchain.prompts import PromptTemplate
import json
from pathlib import Path
import ollama

# model = OllamaLLM(model="llama3.2")

transcript = """
[0.00 - 10.00]: In this video, I will explain the very basics of artificial neural networks for people who have no idea what they are and how they work.
[10.00 - 12.00]: Like at all.
[12.00 - 25.00]: The 2024 Nobel Prize in Physics was awarded to John Hopfield and Jeffrey Hinton for their contributions to artificial neural networks, enabling machine learning and the recent breakthroughs in AI.
[25.00 - 27.00]: Wait what?
[28.00 - 35.00]: Well, not gonna lie. Like most observers, I was very surprised by this choice.
[35.00 - 41.00]: Not because I feel it's undisurbing, but because it's categorized as physics.
[42.00 - 43.00]: I don't know.
[43.00 - 46.00]: I'm the one who is the king of music, I'm the one who is the king of physics.
[46.00 - 47.00]: Physics!
[47.00 - 48.00]: Motherf**k!
[71.00 - 75.00]: What I'm going to do here is go into a lot of details or even math.
[75.00 - 83.00]: Because this is more of a, I don't know anything about machine learning, please explain to me in SpongeBob term situation.
[83.00 - 85.00]: First, neural networks.
[85.00 - 90.00]: Neural networks are based on how biological neurons or nerve cells work in our brain.
[90.00 - 97.00]: These cells take in several input signals, process them, and generate an output signal or signals.
[97.00 - 102.00]: Our brain is made up of a complex network of those neurons.
[102.00 - 108.00]: And artificial neural networks are just computer programs modeled on this very structure.
[108.00 - 112.00]: To be clear, they are not hardware. They do not exist materially.
[112.00 - 117.00]: They are just a diagram describing the structure of a computation.
[117.00 - 123.00]: I can draw an artificial neural network on a piece of paper and do all the calculations by hand.
[123.00 - 127.00]: That is the exact same thing that happens inside the computer.
[127.00 - 129.00]: Or slower of course.
[129.00 - 131.00]: And with more errors.
[131.00 - 133.00]: But that's the first thing.
[133.00 - 139.00]: Artificial neural networks are just computer programs, or rather a structure describing a program.
[139.00 - 145.00]: They can be visualized by a graph containing edges that carry inputs and or outputs,
[145.00 - 148.00]: and notes where the computations are performed.
[148.00 - 153.00]: Typically, notes receive many inputs from all connected nodes.
[153.00 - 160.00]: Computing output and send this to all connected nodes again, like a biological neuron.
[160.00 - 167.00]: A simple example would be that at a node, all incoming inputs are just added up.
[167.00 - 176.00]: Additionally, edges are weighted, meaning they will influence the computation at a node more or less depending on their weight.
[176.00 - 183.00]: For example, all inputs at a node might at first be multiplied by their weight and then added up.
[183.00 - 187.00]: Notice that all the computations performed here are very basic.
[187.00 - 190.00]: It's just addition and multiplication.
[190.00 - 195.00]: And even with just a small number of nodes, you can have a gigantic number of edges.
[195.00 - 201.00]: And this is where the great complexity and also the power of neural networks come from.
[201.00 - 209.00]: Depending on a network, the number of edges can scale exponentially or even super exponentially with the number of nodes.
[209.00 - 214.00]: You can even see that by the interesting optical patterns that such networks create.
[214.00 - 219.00]: You can literally tell the complexity just by looking at them.
[219.00 - 225.00]: But basically, a neural network is just a very complex, convoluted function.
[225.00 - 232.00]: You put some numbers in at one end, some computations are performed and then you get some numbers out.
[243.00 - 253.00]: A hotfield network consists of nodes that can only be in one of two states and are connected to all other nodes by weighted edges that go in both directions symmetrically.
[253.00 - 257.00]: In each computational step, just a single node is chosen.
[257.00 - 264.00]: It takes all inputs from connected nodes together with the weights attached and computes whether it should be flipped or not.
[264.00 - 267.00]: Then another node is chosen, et cetera, et cetera.
[267.00 - 280.00]: A hotfield network can be used to first store patterns and then when it is given another pattern as input, it can retrace to which stored pattern this is the most similar to.
[280.00 - 285.00]: So basically, autocorrect and autocomplete for patterns.
[285.00 - 295.00]: So for example, you could encode the pixels of an image as a pattern and then reconstruct this original pattern from inputs that are similar.
[295.00 - 300.00]: The way this is done is based on an idea from physics, minimizing energy.
[300.00 - 305.00]: You will have noticed that with gravity, things don't move around randomly.
[305.00 - 310.00]: On their own, balls don't ever roll uphill, just down here.
[310.00 - 312.00]: How does a ball know where to roll?
[312.00 - 315.00]: It does not have to try out all possible paths.
[315.00 - 320.00]: Gravity will always make it roll the path most directly down here.
[320.00 - 323.00]: This way, energy is minimized.
[323.00 - 326.00]: The same principle is applied to the hotfield network.
[326.00 - 335.00]: The stored patterns are set as states of lowest energy, local minima, which is achieved by fixing the weights of all edges.
[335.00 - 345.00]: Then, during each step of computation, the energy of the network pattern is evaluated and is changed such that the energies are always minimized.
[345.00 - 349.00]: This will iterate the pattern to the closest local minimum.
[349.00 - 351.00]: So the closest stored pattern.
[351.00 - 362.00]: Note that this is a very basic network with a lot of limitations, but it was one of the first demonstrations of what could be achieved with neural networks.
[374.00 - 379.00]: Let's look at a more capable neural network, classical machine learning.
[380.00 - 391.00]: For example, let's imagine we have a neural network where you enter an image of an animal as input and it tries to figure out whether this is an image of a cat or dog.
[391.00 - 394.00]: You start with a network like this.
[394.00 - 402.00]: Note that there is no clear rule how large a network like this has to be, how many nodes and how many layers it needs, etc.
[402.00 - 406.00]: All of those things come down to trial and error or experience.
[407.00 - 412.00]: Also, the initial weights can be either random or based on experience as well.
[412.00 - 416.00]: You have a number of nodes that take input from outside the program.
[416.00 - 419.00]: In this case, the brightness of pixels of an image.
[419.00 - 423.00]: So, at each input node, you now have a number.
[423.00 - 431.00]: These numbers are then sent to the next layer of nodes, which are called hidden nodes, because they are calculating just an intermediate step of the program.
[432.00 - 442.00]: Again, each node gets a lot of numbers as input and each number will be multiplied by its weight and all of this will then be summed up to get a new number.
[442.00 - 451.00]: Okay, so the numbers of the input layer were the brightness of pixels, but what are the numbers calculated by the hidden layers?
[451.00 - 457.00]: And that's kind of the thing, and that's why we often talk about AI being a black box.
[457.00 - 464.00]: Because these numbers are just representations for some characteristic or pattern within the input.
[464.00 - 470.00]: It's nothing a human could do anything with. In fact, to us, it looks like random noise.
[470.00 - 473.00]: We as humans would use completely different criteria.
[473.00 - 478.00]: For example, we would look at the size of the head or the shape of the ears.
[478.00 - 483.00]: We would use all those to figure out whether an animal were a cat or dog.
[483.00 - 487.00]: A neural network does not know what ears are.
[487.00 - 492.00]: All it sees is numbers and more numbers and patterns within the numbers.
[492.00 - 502.00]: Finally, an output is generated. In this case, a probability that the picture shows a cat and a probability that it is a dog.
[502.00 - 509.00]: And that's where training comes in. You need to tell the network whether the result is correct or not.
[509.00 - 516.00]: For example, the network puts out 80% probability for dog and 20% for cat.
[516.00 - 519.00]: And the image actually shows a dog.
[519.00 - 529.00]: Now, the weights of the network that led to the correct dog output will be amplified, while those weights that led to the wrong cat output will be weakened.
[529.00 - 536.00]: And once a network has been through millions or even billions of those learning cycles, it will be trained.
[536.00 - 542.00]: And it will be pretty good at figuring out whether an image shows a cat or dog.
[542.00 - 548.00]: Or recognize handwriting or recognize speech or whatever it was trained to do.
[548.00 - 554.00]: And again, the network I've shown is somewhat simplified and even outdated.
[554.00 - 561.00]: But it's very good at getting across the basic ideas of machine learning, and that's why I used it.
[561.00 - 568.00]: So physics Nobel for machine learning.
[568.00 - 577.00]: The justification was that a lot of the basic ideas stem from physical models or physical concepts.
[577.00 - 584.00]: And also that the machine learning methods were heavily applied in physics.
[584.00 - 592.00]: For example, to analyze output from particle colliders or to construct images of black holes, etc.
[592.00 - 600.00]: And all of this is true, but does that mean that artificial neural networks and machine learning is physics?
[600.00 - 607.00]: Well, it's not really physics, but it's also not really not physics.
[607.00 - 616.00]: And there have been Nobel Prizes in physics before that were closer to mechanical engineering or electrical engineering.
[616.00 - 620.00]: And now we also have software engineering.
[620.00 - 625.00]: I guess what it all comes down to, at least for me, is that it's physics.
[625.00 - 633.00]: I guess what it all comes down to, at least for me, is that it's fine to make this kind of exceptions.
[633.00 - 642.00]: But only as an exception, but if this kind of stuff became the norm, why call it Nobel Prizes in physics anymore?
[642.00 - 650.00]: I get that. Institutions, especially old institutions, from time to time have to show that they're still up to date and they're still relevant.
[650.00 - 655.00]: But you know, you also have to do what you're supposed to do.
[655.00 - 659.00]: We don't need a second touring award. We already have one.
[659.00 - 668.00]: Anyway, like I said in the intro, this video is focused on the very broad ideas of machine learning.
[668.00 - 675.00]: If you're interested in much more detailed treatments, including even math, you can check out those links.
[675.00 - 679.00]: I think these are really great videos.
[681.00 - 688.00]: As a final thought, hands down the best thing about this was the means.
[688.00 - 692.00]: So I'll let you enjoy a couple of those as an outro.
[692.00 - 697.00]: See you again next year, hopefully with a little bit more physics.
[710.00 - 713.00]: You
[740.00 - 743.00]: You

"""

def analyze_transcript(transcript_path):
    """Analyze transcript using Ollama LLM."""
    with open(transcript_path, 'r', encoding='utf-8') as f:
        transcript_text = f.read()

    prompt_template = f"""
    Analyze the following transcript and provide:
    1. A concise summary
    2. Key points discussed
    3. Main topics covered
    4. Most important moments with their approximate timestamps (format: [HH:MM:SS] - description)
    
    Transcript:
    {transcript}
    
    Respond using JSON
    """

    prompt = prompt_template

    response = ollama.generate(
        model='llama3.2',
        prompt=prompt,
        format='json'
    )
    
    # response = model.invoke(prompt.format(transcript=transcript_text))
    
    try:
        # Parse the response to ensure it's valid JSON
        analysis_data = json.loads(response['response'])
    except json.JSONDecodeError:
        # Fallback structure if response isn't valid JSON
        print('fallback')
        analysis_data = {
            "summary": response['message']['content'],
            "key_points": [],
            "topics": [],
            "key_moments": []
        }
    
    return analysis_data

data = analyze_transcript('../transcript.txt')
# data = json.loads(data)
print(data)