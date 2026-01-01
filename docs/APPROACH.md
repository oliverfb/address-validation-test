# Approach

In the present doc, I will describe the approach I took to build the API.

This project was built with AI-assisted development. Why?
- Speed up research process on options available for address validation
- Build a working prototype quickly with whatever options I chose, and discard them quickly if they don't work out
- Review the generated code and understand challenges and limitations of the options chosen
- Spend more time on refining the solution that works

One of my primary fears with AI-assisted development is delivering code and solutions that I do not fully understand. This is basically delivering black box after black box on each deployment if not done properly, which is not sustainable in the short or long term.

Ths is why, my main policy with AI-assistent development is to always review the generated code, or content in general, to make sure it aligns with the requirements and the problem at hand.

Once a prompt results in a working solution, a git commit is done to avoid future prompts from getting mixed up with the previous ones, reducing the risk of having to start over.

## Utilized Tools

The Cursor IDE was used to generate the code, using GPT 5.1 Codex Max model from OpenAI.

## Process

### 1. The first step was to clearly understand the problem and the requirements.

After understanding the problem and requirements, my first plan was to build a simple API that would communicate with services like Google Maps, or use any other library out there to validate addresses.

### 2. A research was conducted to see what available services and libraries were available to validate addresses. My priority was to not reinvent the wheel and use existing services and libraries for free.

For this, I did both a manual Google search while at the same time, I used Cursor to research options.

The following prompt was provided:

```
You are a Senior Software Engineer.

Your current task is to research third party services or libraries that allows you to validate addresses.
The addresses to validate can be limited to the U.S only, global address validation is a nice to have.
```

The results of this research were obviously the Google Maps API, as well as other python libraries like `usaddress` and `libpostal`. Other options like `smartystreets` and `smartystreets-python` were also there, but I decided to explore the Google Maps API first.

### 3. Read and understand address validation concepts and terminology.

I was not familiar with the terminologies and concepts related to address validation (USPS DPV, CASS, etc.), so I spent some time reading and understanding them, to make sure the solution properly aligns with the requirements.

### 4. Proceed to build an MVP with the Google Maps API, the first option I committed to.

Using Cursor, a plan was built providing the challenge requirements. This resulted in a step by step plan to build the API.

The following prompt was provided after the previous one in planning mode:

```
For context, we are looking to build a simple API that validates and stardadizes property addresses. It should have a single endpoint (POST /validate-address) accepting the address in free-form text. 
The returned data should be a structured, validated version of the address, including street, number, city, state, zip code. 
```

NodeJS was the chosen runtime, using TypeScript on top to make sure the code is type-safe.
Having types and interfaces helps with code readability, and type-related issues, but the most important reason why is to reduce hallucinations and errors when using AI-assisted development.

### 5. Setup the API key and test the API.

After obtaining the API key, the API was tested using postman.

### 6. Refine the solution.

At this point I felt I could simply turn in the MVP and be done with it, however I decided to spend the remaining time to refine the solution. How?

- Containerize the API using Docker.
- Add rate limiting to the API.
- Add API key authentication to the API.
- Documenting and commenting the code.
- Deploy the API
