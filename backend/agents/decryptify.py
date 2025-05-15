from typing import Dict, List, Optional
import sys
import logging
from langchain.tools import Tool
from langchain.agents import create_react_agent
from langchain.llms.base import LLM
from langchain.prompts import PromptTemplate

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("decryptify")

# Import all other agents
from .coin_info import coin_info_tool
from .crypto_scam import crypto_scam_tool
from .certik import certik_tool
from .chainbroker import chainbroker_tool
from .founder_info import founder_info_tool
from .project_info import project_info_tool
from .related_projects import find_related_projects


def decryptify_analysis(query: str, llm: Optional[LLM] = None) -> str:
    """
    Main Decryptify orchestrator that coordinates all agents to provide comprehensive trust assessment
    """
    try:
        logger.info(f"Starting Decryptify analysis for query: {query}")
        # Parse the query to extract project/coin name
        project_name = query.strip()
        logger.info(f"Analyzing project: {project_name}")

        # Initialize response sections
        sections = {
            "market_data": "",
            "scam_analysis": "",
            "security_audit": "",
            "exchange_analysis": "",
            "founder_analysis": "",
            "project_analysis": "",
            "related_projects": [],
        }
        # 1. Get market data
        try:
            logger.info(f"Fetching market data for {project_name}")
            sections["market_data"] = coin_info_tool.func(project_name)
            logger.info("Market data fetched successfully")
        except Exception as e:
            logger.error(f"Error fetching market data: {str(e)}")
            sections["market_data"] = f"Market data unavailable: {str(e)}"

        # 2. Perform scam analysis
        try:
            logger.info(f"Performing scam analysis for {project_name}")
            sections["scam_analysis"] = crypto_scam_tool.func(project_name)
            logger.info("Scam analysis completed")
        except Exception as e:
            logger.error(f"Error in scam analysis: {str(e)}")
            sections["scam_analysis"] = f"Scam analysis unavailable: {str(e)}"
        # 3. Check security audits
        try:
            logger.info(f"Checking security audits for {project_name}")
            sections["security_audit"] = certik_tool.func(project_name)
            logger.info("Security audit check completed")
        except Exception as e:
            logger.error(f"Error checking security audits: {str(e)}")
            sections["security_audit"] = f"Security audit unavailable: {str(e)}"

        # 4. Analyze exchanges (if applicable)
        try:
            if (
                "exchange" in project_name.lower()
                or "binance" in project_name.lower()
                or "coinbase" in project_name.lower()
            ):
                logger.info(f"Performing exchange analysis for {project_name}")
                sections["exchange_analysis"] = chainbroker_tool.func(project_name)
                logger.info("Exchange analysis completed")
            else:
                logger.info(
                    f"{project_name} is not an exchange - skipping exchange analysis"
                )
                sections["exchange_analysis"] = (
                    "Not an exchange - skipping exchange analysis"
                )
        except Exception as e:
            logger.error(f"Error in exchange analysis: {str(e)}")
            sections["exchange_analysis"] = f"Exchange analysis unavailable: {str(e)}"
        # 5. Research founders
        try:
            logger.info(f"Researching founders for {project_name}")
            sections["founder_analysis"] = founder_info_tool.func(project_name)
            logger.info("Founder research completed")
        except Exception as e:
            logger.error(f"Error researching founders: {str(e)}")
            sections["founder_analysis"] = f"Founder analysis unavailable: {str(e)}"

        # 6. Gather project information
        try:
            logger.info(f"Gathering project information for {project_name}")
            sections["project_analysis"] = project_info_tool.func(project_name)
            logger.info("Project information gathering completed")
        except Exception as e:
            logger.error(f"Error gathering project information: {str(e)}")
            sections["project_analysis"] = f"Project analysis unavailable: {str(e)}"

        # 7. Find related projects/founders using the dedicated function (passing the LLM)
        try:
            logger.info(f"Finding related projects for {project_name}")
            sections["related_projects"] = find_related_projects(project_name, llm)
            logger.info(f"Found {len(sections['related_projects'])} related projects")
        except Exception as e:
            logger.error(f"Error finding related projects: {str(e)}")
            sections["related_projects"] = (
                []
            )  # 8. Let the LLM calculate the trust score        # Initialize with None to ensure we properly detect and handle missing LLM scenario
        trust_score = None
        logger.info(f"Beginning trust score calculation for {project_name}")
        if llm:
            try:
                # Combine all analysis for trust score calculation with LLM
                combined_analysis = f"""
                Market Data: {sections['market_data']}
                Scam Analysis: {sections['scam_analysis']}
                Security Audit: {sections['security_audit']}
                Founder Analysis: {sections['founder_analysis']}
                Project Analysis: {sections['project_analysis']}
                """

                # Log the analysis data being used
                logger.info(f"Analysis data assembled for {project_name}")

                # Prompt the LLM to calculate a trust score
                trust_prompt = f"""
                Based on the following analysis of the cryptocurrency project {project_name}, 
                calculate a trust score from 0-10 and provide a brief explanation.
                Higher scores indicate higher trustworthiness. Consider security, tokenomics,
                team credibility, code audits, and other risk factors.
                
                {combined_analysis}
                
                Return only a trust score section in this format:
                Overall Trust Score: [SCORE]/10
                Trust Level: [HIGH/MEDIUM/LOW]
                Reason: [1-2 sentence explanation]                """
                logger.info(f"Invoking LLM for trust score calculation")
                response = llm.invoke(trust_prompt)
                # Extract content based on the return type (could be message object or string)
                if hasattr(response, "content"):
                    trust_score = response.content
                else:
                    trust_score = str(response)

                logger.info(f"Received trust score: {trust_score[:50]}...")
            except Exception as e:
                logger.error(f"Trust score calculation failed: {str(e)}")
                # Create a fallback trust score based on available data
                trust_level = "MEDIUM"
                reasoning = f"Unable to complete full analysis due to: {str(e)}"
                trust_score = f"Overall Trust Score: 5/10\nTrust Level: {trust_level}\nReason: {reasoning}"
        else:
            # If no LLM is provided, we need to generate a basic trust score from available data
            logger.warning(
                "No LLM provided for trust score calculation - generating basic score"
            )

            # Basic heuristics to determine trust
            trust_level = "MEDIUM"  # Default
            trust_value = 5  # Default
            # Check for red flags in scam analysis
            if (
                "scam" in sections["scam_analysis"].lower()
                or "suspicious" in sections["scam_analysis"].lower()
            ):
                trust_level = "LOW"
                trust_value = 3

            # Higher trust for audited projects
            if (
                "audit" in sections["security_audit"].lower()
                and "passed" in sections["security_audit"].lower()
            ):
                trust_level = "HIGH"
                trust_value = 8

            # Special case for well-known cryptocurrencies
            well_known = [
                "bitcoin",
                "btc",
                "ethereum",
                "eth",
                "cardano",
                "ada",
                "solana",
                "sol",
                "binance coin",
                "bnb",
            ]
            if project_name.lower() in well_known or any(
                wk in project_name.lower() for wk in well_known
            ):
                logger.info(f"Recognized well-known cryptocurrency: {project_name}")
                if project_name.lower() in ["bitcoin", "btc"]:
                    trust_level = "HIGH"
                    trust_value = 9
                    reasoning = "Bitcoin is the first cryptocurrency with the longest track record and highest market capitalization."
                elif project_name.lower() in ["ethereum", "eth"]:
                    trust_level = "HIGH"
                    trust_value = 8
                    reasoning = "Ethereum is one of the most established blockchain platforms with a large ecosystem and strong developer community."
                else:
                    trust_level = "HIGH"
                    trust_value = 7
                    reasoning = "Well-established cryptocurrency with significant market presence and community support."

                trust_score = f"Overall Trust Score: {trust_value}/10\nTrust Level: {trust_level}\nReason: {reasoning}"
                logger.info(
                    f"Generated trust score for well-known crypto: {trust_score}"
                )
                return trust_score

            # Generate explanation based on available data
            reasons = []
            if "Market data unavailable" not in sections["market_data"]:
                reasons.append("market data available")
            if "No founder information" not in sections["founder_analysis"]:
                reasons.append("founder information verified")
            if reasons:
                reasoning = f"Basic assessment based on {', '.join(reasons)}"
            else:
                reasoning = "Limited data available for comprehensive assessment"

            trust_score = f"Overall Trust Score: {trust_value}/10\nTrust Level: {trust_level}\nReason: {reasoning}"
            logger.info("Generated basic trust score in absence of LLM")

        # Extract current price from market data
        current_price = "Not available"
        market_cap = "Not available"
        try:
            import re

            price_match = re.search(r"Price: \$([\d,\.]+)", sections["market_data"])
            if price_match:
                current_price = f"${price_match.group(1)}"

            mcap_match = re.search(
                r"Market Cap: \$([\d,\.]+\w?)", sections["market_data"]
            )
            if mcap_match:
                market_cap = f"${mcap_match.group(1)}"
        except Exception:
            pass  # Extract founder info - just the basics
        founder_info = "No founder information available"
        try:
            # Special case for Bitcoin
            if project_name.lower() == "bitcoin" or project_name.lower() == "btc":
                founder_info = "Created by Satoshi Nakamoto (pseudonym). Identity remains unknown. Bitcoin whitepaper was published in 2008."
                logger.info("Using predefined founder info for Bitcoin")
            # Special case for Ethereum
            elif project_name.lower() == "ethereum" or project_name.lower() == "eth":
                founder_info = "Founded by Vitalik Buterin along with Gavin Wood, Charles Hoskinson, and others in 2015."
                logger.info("Using predefined founder info for Ethereum")
            else:
                # Try to extract just the key founder information
                founder_section = sections["founder_analysis"].split("\n")
                for i, line in enumerate(founder_section):
                    if "Founder" in line or "Team" in line or "CEO" in line:
                        founder_info = "\n".join(founder_section[i : i + 3])
                        break
        except Exception as e:
            logger.error(f"Error extracting founder info: {str(e)}")
            pass  # Extract trust level with more robust parsing
        trust_level = "MEDIUM"
        try:
            if "Trust Level:" in trust_score:
                trust_level = (
                    trust_score.split("Trust Level:")[1].split("\n")[0].strip()
                )
                logger.info(f"Extracted trust level: {trust_level}")
            else:
                logger.warning("No 'Trust Level:' found in trust score response")
        except Exception as e:
            logger.error(f"Error extracting trust level: {str(e)}")

        # Extract reasoning with more robust parsing
        reasoning = (
            "Analysis based on market data, security audits, and project history."
        )
        try:
            if "Reason:" in trust_score:
                reasoning = trust_score.split("Reason:")[1].strip()
                logger.info(f"Extracted reasoning: {reasoning[:50]}...")
            else:
                logger.warning("No 'Reason:' found in trust score response")
        except Exception as e:
            logger.error(
                f"Error extracting reasoning: {str(e)}"
            )  # Format a simplified concise response with separate string parts to avoid backslash issues
        project_remark = "No project data available"
        scam_remark = "No scam analysis available"

        # Special case for major cryptocurrencies
        if project_name.lower() == "bitcoin" or project_name.lower() == "btc":
            project_remark = "First decentralized cryptocurrency, created in 2009. Uses proof-of-work consensus."
            scam_remark = "Bitcoin itself is legitimate, but be aware of Bitcoin-related scams and fake wallets."
            logger.info("Using predefined project and scam remarks for Bitcoin")
        elif project_name.lower() == "ethereum" or project_name.lower() == "eth":
            project_remark = (
                "Smart contract platform that enables DApps and DeFi applications."
            )
            scam_remark = "Ethereum is legitimate, but watch for phishing sites and fake airdrops."
            logger.info("Using predefined project and scam remarks for Ethereum")
        else:
            try:
                project_lines = sections["project_analysis"].split("\n")
                if project_lines and len(project_lines) > 0:
                    for line in project_lines:
                        if line.strip():  # Find first non-empty line
                            project_remark = line.strip()
                            break
                logger.info(f"Project remark: {project_remark}")
            except Exception as e:
                logger.error(f"Error extracting project remark: {str(e)}")

            try:
                scam_lines = sections["scam_analysis"].split("\n")
                if scam_lines and len(scam_lines) > 0:
                    for line in scam_lines:
                        if line.strip():  # Find first non-empty line
                            scam_remark = line.strip()
                            break
                logger.info(f"Scam remark: {scam_remark}")
            except Exception as e:
                logger.error(
                    f"Error extracting scam remark: {str(e)}"
                )  # Build response with more robust trust score extraction
        trust_score_value = "N/A"  # Default if we can't extract a proper score
        try:
            if "Overall Trust Score:" in trust_score:
                parts = trust_score.split("Overall Trust Score:")
                if len(parts) > 1:
                    score_line = parts[1].split("\n")[0].strip()
                    if score_line:
                        trust_score_value = score_line
                        logger.info(f"Extracted trust score value: {trust_score_value}")
                    else:
                        logger.warning("Empty trust score value extracted")
            else:
                logger.warning(
                    "No 'Overall Trust Score:' found in trust score response"
                )
                # Try to generate a score if LLM didn't provide one in expected format
                if llm and trust_score:
                    try:
                        # Ask LLM to extract or generate a score
                        extract_prompt = f"Extract or generate a trust score from 0-10 for this analysis: {trust_score}\nJust output the number followed by /10."
                        score_response = llm.invoke(extract_prompt)
                        if hasattr(score_response, "content"):
                            extracted = score_response.content.strip()
                        else:
                            extracted = str(score_response).strip()

                        # Look for a pattern like "7/10" in the response
                        import re

                        score_match = re.search(r"(\d+(?:\.\d+)?)/10", extracted)
                        if score_match:
                            trust_score_value = score_match.group(0)
                            logger.info(
                                f"Generated trust score from content: {trust_score_value}"
                            )
                    except Exception as e:
                        logger.error(
                            f"Error generating trust score from content: {str(e)}"
                        )
        except Exception as e:
            logger.error(f"Error extracting trust score value: {str(e)}")

        # Ensure project and scam remarks are not empty
        if not project_remark or project_remark.isspace():
            project_remark = "No significant project data available"

        if not scam_remark or scam_remark.isspace():
            scam_remark = "No significant risk factors identified"

        # Build the final response with proper formatting
        response = (
            f"{project_name.upper()}\n\n"
            f"Trust Score: {trust_score_value} ({trust_level})\n"
            f"Current Price: {current_price}\n"
            f"Market Cap: {market_cap}\n\n"
            f"Founder: {founder_info}\n\n"
            f"Key Remarks:\n"
            f"- {project_remark}\n"
            f"- {scam_remark}\n\n"
            f"Reasoning: {reasoning}"
        )

        logger.info(f"Analysis complete for {project_name}")
        logger.debug(f"Final response: {response}")
        return response
    except Exception as e:
        error_msg = f"Error performing Decryptify analysis: {str(e)}"
        logger.error(error_msg)
        return error_msg


# Create the tool
decryptify_tool = Tool(
    name="decryptify_orchestrator",
    func=decryptify_analysis,
    description="Main Decryptify orchestrator that coordinates all agents to provide comprehensive crypto trust assessment, metrics, and related projects",
)
